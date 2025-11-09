import Input, { InputProps } from '../input/Input';

interface AutoCompleteProps extends InputProps {
  values: string[];
}

const AutoComplete = ({ values, ...props }: AutoCompleteProps) => {
  return (
    <>
      <Input type="text" list="browsers" {...props} />
      <datalist id="browsers">
        {values.map((value) => (
          <option key={value} value={value}></option>
        ))}
      </datalist>
    </>
  );
};

export default AutoComplete;
