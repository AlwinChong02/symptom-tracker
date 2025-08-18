'use client';

import React, { useState } from 'react';
import { FaBell, FaClock, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { FiRepeat } from 'react-icons/fi';
import { FaPencilAlt } from 'react-icons/fa';

interface Reminder {
    id: number;
    name: string;
    time: string;
    dosage: string;
    frequency: string;
}

type ReminderFormData = Omit<Reminder, 'id'>;

const initialReminders: Reminder[] = [
    {
        id: 1,
        name: 'Amoxicillin',
        time: '8:00 AM, 8:00 PM',
        dosage: '250mg twice daily',
        frequency: 'Every day for 7 days',
    },
    {
        id: 2,
        name: 'Lisinopril',
        time: '9:00 AM',
        dosage: '10mg once daily',
        frequency: 'Every morning indefinitely',
    },
    {
        id: 3,
        name: 'Multivitamin',
        time: '12:00 PM',
        dosage: '1 tablet daily',
        frequency: 'Every day',
    },
];

const MedicationReminders = () => {
    const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentReminder, setCurrentReminder] = useState<Reminder | null>(null);

    const handleAddReminder = (reminderData: ReminderFormData) => {
        setReminders([...reminders, { ...reminderData, id: Date.now() }]);
    };

    const handleUpdateReminder = (updatedReminder: Reminder) => {
        setReminders(reminders.map(r => r.id === updatedReminder.id ? updatedReminder : r));
    };

    const handleDeleteReminder = (id: number) => {
        setReminders(reminders.filter(r => r.id !== id));
    };

    const openModal = (reminder: Reminder | null = null) => {
        setCurrentReminder(reminder);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentReminder(null);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-2xl mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold text-center mb-6">Medication Reminders</h1>
                <button onClick={() => openModal()} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg mb-8">
                    <FaPlus className="mr-2" /> Add New Reminder
                </button>

                <h2 className="text-xl font-bold mb-4">Upcoming Reminders</h2>

                <div className="space-y-4">
                    {reminders.map((reminder) => (
                        <div key={reminder.id} className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center mb-4">
                                <FaBell className="text-blue-500 mr-3" size={20} />
                                <h3 className="text-lg font-semibold">{reminder.name}</h3>
                            </div>
                            <div className="space-y-3 text-gray-600">
                                <div className="flex items-center">
                                    <FaClock className="mr-3" />
                                    <span>{reminder.time}</span>
                                </div>
                                <div className="flex items-center">
                                    <FaPencilAlt className="mr-3" />
                                    <span>{reminder.dosage}</span>
                                </div>
                                <div className="flex items-center">
                                    <FiRepeat className="mr-3" />
                                    <span>{reminder.frequency}</span>
                                </div>
                            </div>
                            <div className="flex justify-end mt-6 space-x-2">
                                <button onClick={() => openModal(reminder)} className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">
                                    <FaEdit className="mr-2" /> Edit
                                </button>
                                <button onClick={() => handleDeleteReminder(reminder.id)} className="flex items-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">
                                    <FaTrash className="mr-2" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {isModalOpen && (
                    <ReminderForm
                        reminder={currentReminder}
                        onSave={(data) => {
                            if (data.id) {
                                handleUpdateReminder(data as Reminder);
                            } else {
                                handleAddReminder(data);
                            }
                            closeModal();
                        }}
                        onClose={closeModal}
                    />
                )}
            </div>
        </div>
    );
};

interface ReminderFormProps {
    reminder: Reminder | null;
    onSave: (data: ReminderFormData & { id?: number }) => void;
    onClose: () => void;
}

const ReminderForm = ({ reminder, onSave, onClose }: ReminderFormProps) => {
    const [name, setName] = useState(reminder?.name || '');
    const [time, setTime] = useState(reminder?.time || '');
    const [dosage, setDosage] = useState(reminder?.dosage || '');
    const [frequency, setFrequency] = useState(reminder?.frequency || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...(reminder || {}), name, time, dosage, frequency });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{reminder ? 'Edit Reminder' : 'Add New Reminder'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Medication Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Time</label>
                        <input type="text" value={time} onChange={(e) => setTime(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Dosage</label>
                        <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Frequency</label>
                        <input type="text" value={frequency} onChange={(e) => setFrequency(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                    </div>
                    <div className="flex items-center justify-end">
                        <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                            Cancel
                        </button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MedicationReminders;
