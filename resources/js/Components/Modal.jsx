import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export default function Modal({ children, show = false, maxWidth = '2xl', closeable = true, onClose = () => {} }) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const maxWidthClass = {
        sm:     'sm:max-w-sm',
        md:     'sm:max-w-md',
        lg:     'sm:max-w-lg',
        xl:     'sm:max-w-xl',
        '2xl':  'sm:max-w-2xl',
        '3xl':  'sm:max-w-3xl',
        '4xl':  'sm:max-w-4xl',
        '5xl':  'sm:max-w-5xl',
        '6xl':  'sm:max-w-6xl',
        '7xl':  'sm:max-w-7xl',
        screen: 'sm:max-w-[95vw]',
    }[maxWidth] ?? 'sm:max-w-2xl';

    return (
        <Transition show={show} as={Fragment} leave="duration-200">
            <Dialog
                as="div"
                id="modal"
                className="fixed inset-0 z-50 overflow-y-auto"
                onClose={close}
            >
                {/* Full-screen container to centre the panel */}
                <div className="flex min-h-full items-center justify-center px-4 py-8 sm:px-6">
                    {/* Backdrop */}
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500/75" />
                    </Transition.Child>

                    {/* Panel */}
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <Dialog.Panel
                            className={`relative bg-white rounded-lg shadow-xl transform transition-all w-full sm:mx-auto ${maxWidthClass}`}
                        >
                            {children}
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
