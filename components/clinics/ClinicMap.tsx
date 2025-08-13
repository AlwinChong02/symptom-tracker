import { FC } from 'react';

interface ClinicMapProps {
  onError: (message: string) => void;
}

const ClinicMap: FC<ClinicMapProps> = ({ onError }) => {
  return (
    <div className="text-center p-8 bg-gray-50 rounded-lg">
      <h3 className="text-xl font-semibold text-gray-700">Map Feature Coming Soon</h3>
      <p className="text-gray-500 mt-2">
        The interactive map for finding nearby clinics is currently under development.
      </p>
    </div>
  );
};

export default ClinicMap;
