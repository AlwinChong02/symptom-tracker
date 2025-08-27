'use client';

import React, { useState } from 'react';
import { FaBell, FaClock, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { FiRepeat } from 'react-icons/fi';
import { FaPencilAlt } from 'react-icons/fa';
import type { Frequency, DayOfWeek } from '@/types/reminder';

interface ReminderUI {
    id: number;
    name: string;
    dosage: string;
    frequency: Frequency;
    times: string[];
    startDate?: string;
    daysOfWeek?: DayOfWeek[];
}

type ReminderFormData = Omit<ReminderUI, 'id'>;

const initialReminders: ReminderUI[] = [
    {
        id: 1,
        name: 'Amoxicillin',
        dosage: '250mg twice daily',
        frequency: 'Daily',
        times: ['08:00', '20:00'],
        startDate: new Date().toISOString().slice(0, 10),
    },
    {
        id: 2,
        name: 'Lisinopril',
        dosage: '10mg once daily',
        frequency: 'Daily',
        times: ['09:00'],
        startDate: new Date().toISOString().slice(0, 10),
    },
    {
        id: 3,
        name: 'Multivitamin',
        dosage: '1 tablet daily',
        frequency: 'Weekly',
        times: ['12:00'],
        daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
        startDate: new Date().toISOString().slice(0, 10),
    },
];

const MedicationReminders = () => {
    const [reminders, setReminders] = useState<ReminderUI[]>(initialReminders);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentReminder, setCurrentReminder] = useState<ReminderUI | null>(null);

    const handleAddReminder = (reminderData: ReminderFormData) => {
        setReminders([...reminders, { ...reminderData, id: Date.now() }]);
    };

    const handleUpdateReminder = (updatedReminder: ReminderUI) => {
        setReminders(reminders.map(r => r.id === updatedReminder.id ? updatedReminder : r));
    };

    const handleDeleteReminder = (id: number) => {
        setReminders(reminders.filter(r => r.id !== id));
    };

    const openModal = (reminder: ReminderUI | null = null) => {
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
                                    <span>
                                        {Array.isArray(reminder.times) ? reminder.times.join(', ') : ''}
                                        {reminder.startDate && ` • Start: ${new Date(reminder.startDate).toLocaleDateString()}`}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <FaPencilAlt className="mr-3" />
                                    <span>{reminder.dosage}</span>
                                </div>
                                <div className="flex items-center">
                                    <FiRepeat className="mr-3" />
                                    <span>
                                        {reminder.frequency}
                                        {reminder.frequency === 'Weekly' && reminder.daysOfWeek && reminder.daysOfWeek.length > 0 &&
                                            ` • ${reminder.daysOfWeek.join(', ')}`}
                                    </span>
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
                                handleUpdateReminder(data as ReminderUI);
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
    reminder: ReminderUI | null;
    onSave: (data: ReminderFormData & { id?: number }) => void;
    onClose: () => void;
}

const ReminderForm = ({ reminder, onSave, onClose }: ReminderFormProps) => {
    const [name, setName] = useState(reminder?.name || '');
    const [dosage, setDosage] = useState(reminder?.dosage || '');
    const [frequency, setFrequency] = useState<Frequency>(reminder?.frequency || 'Daily');
    const [times, setTimes] = useState<string[]>(reminder?.times || ['']);
    const [startDate, setStartDate] = useState<string>(reminder?.startDate || '');
    const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>(reminder?.daysOfWeek || []);

    const addTimeInput = () => setTimes((prev) => [...prev, '']);
    const removeTimeInput = (idx: number) => setTimes((prev) => prev.filter((_, i) => i !== idx));
    const handleTimeChange = (idx: number, value: string) => setTimes((prev) => prev.map((t, i) => (i === idx ? value : t)));
    const toggleDay = (day: DayOfWeek) =>
        setDaysOfWeek((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...(reminder || {}),
            name,
            dosage,
            frequency,
            times: times.filter(Boolean),
            startDate: startDate || undefined,
            daysOfWeek: frequency === 'Weekly' ? daysOfWeek : [],
        });
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center">
            <div className="bg-white/75 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-6">{reminder ? 'Edit Reminder' : 'Add New Reminder'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Medication Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Times</label>
                        {times.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-2 mb-2">
                                <input
                                    type="time"
                                    value={t}
                                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                                {times.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeTimeInput(idx)}
                                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addTimeInput} className="text-blue-600 text-sm">+ Add another time</button>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Dosage</label>
                        <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Frequency</label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value as Frequency)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="As Needed">As Needed</option>
                        </select>
                        {frequency === 'Weekly' && (
                            <div className="mt-3">
                                <label className="block text-gray-700 text-sm font-semibold mb-2">Select Days</label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                    {(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] as DayOfWeek[]).map((day) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDay(day)}
                                            className={`p-2 border rounded text-sm ${daysOfWeek.includes(day) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                        >
                                            {day.slice(0,3)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
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
