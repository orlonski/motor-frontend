import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-gray-700">{message}</p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onClose} className="btn btn-secondary">
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="btn btn-danger"
          >
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
