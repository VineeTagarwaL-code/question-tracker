'use client';
import useModal from '@/hooks/useModal';
import Modal from './Modal';
import MDEditor from '@uiw/react-md-editor';
import { usePathname, useSearchParams } from 'next/navigation';
import { ElementRef, useEffect, useRef, useState } from 'react';
import { getUpdatedUrl, searchParamsToObject } from '@/lib/functions';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { useAction } from '@/hooks/useAction';
import { createQuestion } from '@/actions/question';
import { toast } from 'sonner';
import { FormErrors } from './form/form-errors';
import { FormInput } from './form/form-input';

export const NewPostDialog = () => {
  const formRef = useRef<ElementRef<'form'>>(null);
  const searchParam = useSearchParams();
  const paramsObject = searchParamsToObject(searchParam);
  const path = usePathname();
  const router = useRouter();
  const [value, setValue] = useState<string>('**Hello world!!!**');
  const [editorHeight, setEditorHeight] = useState<number>(200);
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref, onOpen, onClose } = useModal();
  const handleMarkdownChange = (newValue?: string) => {
    if (typeof newValue === 'string') {
      setValue(newValue);
    }
  };
  useEffect(() => {
    if (paramsObject.newPost === 'open') {
      onOpen();

      const timeoutId = setTimeout(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setEditorHeight(rect.height);
        }
      }, 0); // Adjust the delay time if needed

      // Cleanup function to clear the timeout
      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      onClose();
    }
  }, [onClose, onOpen, paramsObject.newPost]);

  const handleOnCloseClick = () => {
    router.push(getUpdatedUrl(path + '/', paramsObject, { newPost: 'close' }));
  };
  const { execute, fieldErrors } = useAction(createQuestion, {
    onSuccess: (data) => {
      toast.success(`Question "${data.title}" created`);
      formRef?.current?.reset();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = (formData: FormData) => {
    const title = formData.get('title');

    const tags = formData.get('tags');

    execute({
      title: title?.toString() || '',
      content: value,
      tags: (tags?.toString() || '').split(','),
    });
    if (!fieldErrors?.content && !fieldErrors?.title && !fieldErrors?.tags) {
      setValue('');
      router.push(
        getUpdatedUrl(path + '/', paramsObject, { newPost: 'close' })
      );
    }
  };
  return (
    <Modal ref={ref} onClose={handleOnCloseClick}>
      <form ref={formRef} action={onSubmit}>
        <div className="fixed inset-0 flex items-center justify-center z-50  p-4 md:p-8">
          <div
            ref={containerRef}
            className="relative z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl md:max-w-4xl pt-8 p-2 space-y-4  w-full h-5/6 "
          >
            <button
              type="button"
              className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
              onClick={handleOnCloseClick}
            >
              x
            </button>
            <FormInput
              id="title"
              placeholder="Enter question title..."
              errors={fieldErrors}
            />
            <div className="flex-grow">
              <MDEditor
                id="content"
                value={value}
                onChange={handleMarkdownChange}
                style={{ height: '100%' }}
                height={editorHeight - 200}
                visibleDragbar={false}
              />
              <FormErrors id="content" errors={fieldErrors} />
            </div>
            <FormInput
              id="tags"
              placeholder="Enter tags seperated by comma : hello,world"
              errors={fieldErrors}
            />
            <Button type="submit">Hello world</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
