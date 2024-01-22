<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	import { Button } from '$lib/components/ui/button';
	import { AlertTriangle } from 'lucide-svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';

	let error = '';
	let errorMessage = '';

	let email = '';

	async function sendResetEmail() {
		error = '';
		errorMessage = '';

		const response = await fetch('/api/reset-password', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ email: email })
		});
		if (!response.ok) {
			error = response.statusText;
			const data = await response.json();
			errorMessage = data.message;
		}
	}
</script>

<main class="flex flex-col items-center justify-center px-4">
	<h1 class="text-primar mb-2 text-4xl font-bold">Nulstil din adgangskode</h1>
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
			<Card.Title>Send link til nulstilning</Card.Title>
			<Card.Description
				>Vi kan sende dig en email med at link, så kun kan ændre din adgangkode.</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<div class="flex w-full max-w-sm flex-col gap-1.5">
				<Label for="email">E-mail</Label>
				<Input bind:value={email} type="email" id="email" placeholder="email" />
			</div>
		</Card.Content>
		<Card.Footer class="justify-between">
			<Button variant="outline" href="/login">Tilbage til login</Button>

			<Button on:click={sendResetEmail}>Send nulstil link</Button>
		</Card.Footer>
	</Card.Root>
</main>
