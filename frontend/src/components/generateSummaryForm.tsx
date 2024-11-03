import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProgressUpdate } from '@/hooks/useProgressUpdate';
import useSockets from '@/hooks/useSocket';
import {
  generateSummarySchema,
  GenerateSummaryType,
} from '@/utils/schema/generateSummary';
import { zodResolver } from '@hookform/resolvers/zod';
import 'axios';
import axios from 'axios';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

function GenerateSummaryForm() {
  const { connectionStatus, socketConnection } = useSockets();
  const form = useForm<GenerateSummaryType>({
    resolver: zodResolver(generateSummarySchema),
    defaultValues: {
      text: '',
      number: 10,
    },
  });

  const { isLoading, progress } = useProgressUpdate({
    socketClient: socketConnection.socketClient,
  });

  const onSubmit = useCallback(
    async (data: GenerateSummaryType) => {
      console.log('Form submitted:', data);

      const BASE_URL = import.meta.env.VITE_BASE_URL;
      try {
        const resp = await axios.post(`${BASE_URL}/summary`, {
          text: data.text,
          groupSize: data.number,
          clientId: socketConnection.socketClient.id,
        });

        console.log('response', resp);
      } catch (error) {
        console.log('error occured while submitting the form', error);
      }
    },
    [socketConnection.socketClient.id],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='mx-auto max-w-md space-y-6 rounded-lg bg-white p-6 shadow-md'
      >
        <FormField
          control={form.control}
          name='text'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Enter your large blob of text here...'
                  className='min-h-[150px]'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='number'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Sentences</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='Enter a number'
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value) : '',
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={!connectionStatus || isLoading}
          type='submit'
          className='w-full'
        >
          {isLoading ? `Summarising: ${progress}%` : 'Submit'}
        </Button>
      </form>
    </Form>
  );
}

export default GenerateSummaryForm;
