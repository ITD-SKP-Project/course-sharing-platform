import { handleErrorWithSentry, replayIntegration } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: 'https://bd0b656d83362f80416a093a00c42a41@o4506914465447936.ingest.us.sentry.io/4506914478358528',
	tracesSampleRate: 1.0,

	// This sets the sample rate to be 10%. You may want this to be 100% while
	// in development and sample at a lower rate in production
	replaysSessionSampleRate: 0.1,

	// If the entire session is not sampled, use the below sample rate to sample
	// sessions when an error occurs.
	replaysOnErrorSampleRate: 1.0,

	// If you don't want to use Session Replay, just remove the line below:
	beforeSend(event, hint) {
		// Check if it is an exception, and if so, show the report dialog
		if (event.exception && event.event_id) {
			Sentry.showReportDialog({ eventId: event.event_id });
		}
		return event;
	},
	integrations: [replayIntegration()]
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
