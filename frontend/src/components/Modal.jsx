// ✅ src/components/Modal.jsx
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 shadow-lg w-80">
        {children}
        <button onClick={onClose} className="text-sm text-gray-500 mt-4">닫기</button>
      </div>
    </div>
  );
};

export default Modal;