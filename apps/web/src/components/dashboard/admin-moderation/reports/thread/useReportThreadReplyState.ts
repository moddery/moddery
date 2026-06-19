import { useState } from 'react';

import { createReportThreadMessage } from '../../../../../lib/dashboard.ts';

export function useReportThreadReplyState({
  onPosted,
  reportId,
}: {
  onPosted: () => Promise<unknown>;
  reportId: string;
}) {
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: { preventDefault: () => void }) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await createReportThreadMessage({ body, reportId });
      setBody('');
      await onPosted();
      setMessage(reportThreadReplyMessage());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Reply failed');
    } finally {
      setSubmitting(false);
    }
  }

  return {
    body,
    error,
    message,
    setBody,
    submit,
    submitting,
  };
}

export function reportThreadReplyMessage() {
  return 'Reply posted.';
}
