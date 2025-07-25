import { useEffect, useState, useRef, Fragment } from 'react';
import { router, usePage } from '@inertiajs/react';
import { fetchGroups } from '@/components/nav-main';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'react-hot-toast';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';

interface Group {
    id: number;
    title: string;
}

type GroupOption = Group | { id: 'public'; title: 'Public' };

export default function AddPost() {
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const page = usePage();
    const flash = page?.props?.flash as { success?: string; error?: string } | undefined;
    const [description, setDescription] = useState('');
    const [groups, setGroups] = useState<GroupOption[]>([{ id: 'public', title: 'Public' }]);
    const [selectedGroup, setSelectedGroup] = useState<GroupOption>(groups[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const errors = page.props.errors as Record<string, string>;
    const [media, setMedia] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [isVideo, setIsVideo] = useState<boolean>(false);
    const [videoPlaying, setVideoPlaying] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (errors) Object.values(errors).forEach(msg => toast.error(msg));
    }, [flash, errors]);

    useEffect(() => {
        fetchGroups().then((fetched) =>
            setGroups([{ id: 'public', title: 'Public' }, ...fetched])
        );
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const processFile = (file: File) => {
        if (!['image/jpeg', 'image/jpg', 'image/png', 'video/mp4'].includes(file.type)) {
            toast.error('Invalid file type. Please upload an image (JPEG, JPG, PNG) or video (MP4).');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setMediaPreview(reader.result as string);
            setIsVideo(file.type === 'video/mp4');
        };
        reader.readAsDataURL(file);

        setMedia(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setUploadProgress(0);

        if (!media) {
            setError('Please upload an image or video.');
            setIsSubmitting(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('media', media);
            formData.append('description', description);
            formData.append('group_id', selectedGroup.id === 'public' ? 'public' : selectedGroup.id.toString());

            await router.post('/posts', formData, {
                onProgress: (progress) => {
                    // Update progress (Inertia.js doesn't provide progress by default, so we'll simulate it)
                    // For real progress tracking, you'd need a custom solution or different library
                    if (progress) {
                        setUploadProgress(Math.round((progress.loaded / progress.total!) * 100));
                    } else {
                        // Fallback: simulate progress if not available
                        const interval = setInterval(() => {
                            setUploadProgress(prev => {
                                if (prev >= 100) {
                                    clearInterval(interval);
                                    return 100;
                                }
                                return prev + 10;
                            });
                        }, 300);
                    }
                },
                onSuccess: () => {
                    setDescription('');
                    setMedia(null);
                    setMediaPreview(null);
                    setUploadProgress(0);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                },
                onFinish: () => {
                    setIsSubmitting(false);
                    setUploadProgress(0);
                },
            });
        } catch (err) {
            setError('Failed to create post. Please try again.');
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const toggleVideo = () => {
        if (videoRef.current) {
            if (videoPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setVideoPlaying(!videoPlaying);
        }
    };

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto px-4 py-10">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl"
                >
                    <h2 className="text-2xl font-semibold text-white text-center mb-6">Upload Post</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Side – Form Fields */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Select Group</label>
                                <Listbox value={selectedGroup} onChange={setSelectedGroup}>
                                    <div className="relative">
                                        <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-black py-2 pl-3 pr-10 text-left text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/60 sm:text-sm">
                                            <span className="block truncate">{selectedGroup.title}</span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronUpDownIcon className="h-5 w-5 text-white/40" />
                                            </span>
                                        </Listbox.Button>
                                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-black text-white border border-white/20 py-1 text-base shadow-lg focus:outline-none sm:text-sm">
                                                {groups.map((group) => (
                                                    <Listbox.Option
                                                        key={group.id}
                                                        value={group}
                                                        className={({ active }) =>
                                                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-white/10 text-white' : 'text-white'}`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{group.title}</span>
                                                                {selected && (
                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                                        <CheckIcon className="h-5 w-5 text-white" />
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </Listbox>
                            </div>

                            <div>
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-white/80 mb-1">Description</label>
                                    <span className="text-xs text-white/40">{description.length}/500</span>
                                </div>
                                <textarea
                                    className="w-full h-28 resize-none rounded-xl px-3 py-2 bg-black/40 text-white border border-white/20 focus:ring-2 focus:ring-white outline-none transition-all hover:border-white/40"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                                    placeholder="Write a caption..."
                                    maxLength={500}
                                />
                            </div>

                            {error && (
                                <div className="bg-red-500/20 border border-red-500/40 text-red-200 px-4 py-2 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">Upload Image/Video</label>
                            <div
                                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${!mediaPreview ? 'border-white/20 hover:border-white' : 'border-transparent'}`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                {mediaPreview ? (
                                    isVideo ? (
                                        <div className="relative group">
                                            <video
                                                ref={videoRef}
                                                src={mediaPreview}
                                                className="w-full rounded-xl shadow-lg max-h-72 object-cover mx-auto cursor-pointer"
                                                controls={false}
                                                loop
                                                muted
                                                onClick={toggleVideo}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                                                    {videoPlaying ? 'Pause' : 'Play'}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative group">
                                            <img
                                                src={mediaPreview}
                                                alt="Preview"
                                                className="w-full rounded-xl shadow-lg max-h-72 object-cover mx-auto group-hover:opacity-90 transition-opacity"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                                                    Change File
                                                </span>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="space-y-2">
                                        <svg className="w-12 h-12 mx-auto text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm text-white/60">Drag & drop an image or video here, or click to select</p>
                                        <p className="text-xs text-white/40">Supports: JPG, JPEG, PNG, MP4</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg, video/mp4"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        {/* Progress bar - only show when uploading */}
                        {isSubmitting && (
                            <div className="w-full bg-white rounded-full h-2.5">
                                <div
                                    className="bg-black h-2.5 rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || !media}
                            className={`w-full max-w-xs py-3 rounded-xl transition-all flex items-center justify-center ${isSubmitting
                                    ? 'bg-gray-500/50 cursor-not-allowed'
                                    : !media
                                        ? 'bg-gray-500/50 cursor-not-allowed'
                                        : 'bg-gray-300 text-black hover:bg-gray-500 hover:text-white'
                                } shadow-md hover:shadow-lg`}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing...'}
                                </>
                            ) : (
                                'Post'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}