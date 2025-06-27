import { useRef, useState } from 'react';
import { IconPhotoScan } from '@tabler/icons-react';

import { Image } from '@/types/image';

import IconButton, { IconButtonProps } from '../button/IconButton';

import PreviewImage from './PreviewImage';

type IconButtonType = Omit<IconButtonProps, 'onChange' | 'value' | 'icon'> &
  Partial<Pick<IconButtonProps, 'icon'>>;

interface ImageUploadProps extends IconButtonType {
  className?: string;
  name?: string;
  disabled?: boolean;
  value?: Partial<Image> | null;
  accept?: string;
  multiple?: boolean;
  isPreview?: boolean;
  previewWidth?: number;
  previewHeight?: number;
  onChange: (file: File[]) => void;
}

const ImageUpload = ({
  className,
  icon,
  name = '',
  disabled = false,
  value = null,
  accept = 'image/*',
  multiple = false,
  isPreview = false,
  previewWidth = 200,
  previewHeight = 200,
  onChange,
}: ImageUploadProps) => {
  const imageRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    event.stopPropagation();
    event.preventDefault();

    const files = event.target.files;

    onChange(files ? [...files] : []);

    if (!isPreview || !files || files.length === 0) return;

    const readers = [...files].map(
      (file) =>
        new Promise<string>((res) => {
          const reader = new FileReader();

          reader.onload = () => {
            res(reader.result as string);
          };

          reader.readAsDataURL(file);
        }),
    );

    Promise.all(readers).then((results) => {
      setPreview(multiple ? results : [results[0]]);
    });

    setImages([...files]);
  };

  const handleClick: React.MouseEventHandler = () => {
    imageRef.current?.click();
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <input
          ref={imageRef}
          className="hidden"
          type="file"
          name={name}
          multiple={multiple}
          disabled={disabled}
          accept={accept}
          onChange={handleChange}
        />
        <IconButton
          type="button"
          icon={icon || <IconPhotoScan height={20} stroke={2} />}
          onClick={handleClick}
        >
          Upload
        </IconButton>
        <span className="text-primary-color">
          {value?.name || images?.[0]?.name}
        </span>
      </div>

      {isPreview && (
        <div className="mt-2">
          {preview.map((image, index) => (
            <PreviewImage
              key={index}
              src={image}
              width={previewWidth}
              height={previewHeight}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
