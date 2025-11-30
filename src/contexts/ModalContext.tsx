import { createContext, useContext, useState, type ReactNode } from 'react';

type ModalType = 'save' | 'findReplace' | 'insertImage' | 'insertLink' | 'insertTable' | 'pageSetup' | null;

interface ModalContextType {
    activeModal: ModalType;
    modalData: any;
    openModal: (type: ModalType, data?: any) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [modalData, setModalData] = useState<any>(null);

    const openModal = (type: ModalType, data?: any) => {
        setActiveModal(type);
        setModalData(data);
    };

    const closeModal = () => {
        setActiveModal(null);
        setModalData(null);
    };

    return (
        <ModalContext.Provider value={{ activeModal, modalData, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within ModalProvider');
    }
    return context;
};
