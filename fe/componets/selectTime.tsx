export const SelectTime = ({
	value,
	onChange,
}: {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) => {
	return (
		<select value={value} onChange={onChange} className="bg-blue-800  border border-gray-700 rounded-md p-2">
			<option value="1">1 Minute</option>
			<option value="5">5 Minutes</option>
			<option value="15">15 Minutes</option>
			<option value="60">1 Hour</option>
			<option value="1440">1 Day</option>
		</select>
	);
};
