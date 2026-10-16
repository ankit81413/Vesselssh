import { useRef, useState } from 'react'
import useClickOutside from '../../hooks/useClickOutside';
import { useLogout } from '../../hooks/lib/useLogout';

export default function TaskbarPowerbutton() {

    const [showPowerMenu, setShowPowerMenu] = useState(false);
    const PowerMenuRef = useRef(null);
    const { logout, isLoggingOut } = useLogout();

    useClickOutside(PowerMenuRef, () => {
        setShowPowerMenu(false)
    })
    return (
        <div className="relative hidden md:block">
            <button
                title="Power"
                aria-label="Power menu"
                aria-expanded={showPowerMenu}
                onClick={() => setShowPowerMenu((prev) => !prev)}
                className="hidden h-8 w-8 place-items-center rounded-md hover:bg-cyan-100/12 md:grid"
            >
                <i className="fa-solid fa-power-off text-xs" />
            </button>

            {showPowerMenu && (
                <div className="absolute bottom-full right-0 z-50 mb-3 w-44 rounded-xl border border-cyan-100/15 bg-slate-950/95 p-2 shadow-xl backdrop-blur-xl" ref={PowerMenuRef}>
                    <button
                        type="button"
                        disabled={isLoggingOut}
                        onClick={() => {
                            setShowPowerMenu(false);
                            void logout();
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-400/10 disabled:opacity-50"
                    >
                        <i className="fa-solid fa-right-from-bracket" />
                        {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                </div>
            )}
        </div>
    )
}
