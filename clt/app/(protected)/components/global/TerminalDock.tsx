import React from 'react'

export default function TerminalDock() {
    return (
        <>
            <div className='h-6 w-25 absolute z-21 m-[5px]'>
                <div className='bg-black/30 w-full h-full rounded-xl flex justify-center items-center cursor-pointer hover:bg-black'>
                    <p className='text-sm mb-1 text-white/50  hover:text-white'>&gt;_ Terminal</p>
                </div>
            </div>
        </>
    )
}
