<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { AlertTriangle } from 'lucide-svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { user } from '$lib/index';

	export let data: PageData;

	import * as Card from '$lib/components/ui/card';

	//the last time the user send an email
	const lastSendEmail: Date = data.user?.last_send_email ?? $user?.last_send_email ?? new Date();
	const now = new Date();
	const then = new Date(lastSendEmail);

	let timeSinceLastSendEmail = now.getTime() - then.getTime();
	//reactive seconds left
	let secondsLeft = 60 - Math.floor(timeSinceLastSendEmail / 1000);
	//decrement secondsLeft every second
	const interval = setInterval(() => {
		secondsLeft--;
	}, 1000);

	let error: string = '';
	let errorMessage: string = '';

	async function sendEmail() {
		if (secondsLeft > 0) return;
		error = '';
		errorMessage = '';

		const response = await fetch('/api/send-email-verification-link', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ email: data.user?.email })
		});
		if (!response.ok) {
			error = response.statusText;
			const data = await response.json();
			errorMessage = data.message;
		}
		secondsLeft = 60;
	}
</script>

<main class="flex flex-col items-center justify-center px-4">
	<h1 class="text-primar mb-2 text-4xl font-bold">Bekræft din e-mail</h1>
	<!--
	<h2>Før du kan begynde at oprette projekter, skal vi lige vide lidt mere om dig.</h2> -->
	{#if error}
		<Alert.Root variant="destructive" class="w-full max-w-md border-red-500 text-red-500">
			<AlertTriangle class="h-4 w-4 " />
			<Alert.Title>Fejl: {error}</Alert.Title>
			<Alert.Description>{errorMessage}</Alert.Description>
		</Alert.Root>
	{/if}
	<Card.Root class="mt-8">
		<Card.Header>
			<Card.Title>Tjek din e-mail</Card.Title>
			<Card.Description
				>Vi har sends en email til {data.user?.email}. Tip: husk at kigge i spam mappen.</Card.Description
			>
		</Card.Header>
		<Card.Content>
			{#if secondsLeft > 0}
				<p class="text-center">
					Hvis du ikke har modtaget en mail, <br /> kan du sende en ny email om {secondsLeft} sekunder
				</p>
			{/if}
		</Card.Content>
		<Card.Footer>
			<Button disabled={secondsLeft > 0} on:click={sendEmail}>Send ny email</Button>
		</Card.Footer>
	</Card.Root>
</main>
