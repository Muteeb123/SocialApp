import { Globe, Globe2 } from 'lucide-react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md ">
                  <Globe2 size={50}/>
            </div>
        
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">Post Sphere</span>
            </div>
        </>
    );
}
