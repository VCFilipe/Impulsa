import React, { useState } from 'react';
import { Event, AttendanceType } from '../../types';
import SidePanel from '../ui/SidePanel';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { formatDateToDisplay } from '../../utils/dateUtils';

interface MarkAttendancePanelProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onSubmit: (eventId: string, attendanceType: AttendanceType) => void;
}

const MarkAttendancePanel: React.FC<MarkAttendancePanelProps> = ({ isOpen, onClose, event, onSubmit }) => {
  const [attendanceType, setAttendanceType] = useState<AttendanceType | ''>(AttendanceType.PRESENCIAL);
  const [error, setError] = useState<string>('');

  const handleSubmit = () => {
    if (!attendanceType) {
        setError('Por favor, selecione como você participará.');
        return;
    }
    setError('');
    onSubmit(event.id, attendanceType);
  };

  const attendanceOptions = [
    { value: AttendanceType.PRESENCIAL, label: 'Presencial' },
    { value: AttendanceType.HOME_OFFICE, label: 'Home Office' },
  ];

  // Reset state when panel opens or event changes
  React.useEffect(() => {
    if (isOpen) {
      setAttendanceType(AttendanceType.PRESENCIAL);
      setError('');
    }
  }, [isOpen, event]);


  return (
    <SidePanel isOpen={isOpen} onClose={onClose} title="Marcar Presença">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{event.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatDateToDisplay(event.date)} às {event.time}
          </p>
        </div>

        <Select
          label="Como você participará?"
          id="attendanceType"
          value={attendanceType}
          onChange={(e) => {
            setAttendanceType(e.target.value as AttendanceType);
            if (error) setError('');
          }}
          options={attendanceOptions}
          error={error}
          required
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" onClick={handleSubmit}>
            Salvar Presença
          </Button>
        </div>
      </div>
    </SidePanel>
  );
};

export default MarkAttendancePanel;