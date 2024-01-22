<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	import { Button } from '$lib/components/ui/button';
	import { AlertTriangle } from 'lucide-svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';

	let error = '';
	let errorMessage = '';

	let email = '';
	let currentPage = 'beforeSend';

	function validateEmail(email: string) {
		const re = /\S+@\S+\.\S+/;
		return re.test(email);
	}

	async function sendResetEmail() {
		error = '';
		errorMessage = '';

		const response = await fetch('/api/password/send-reset-link', {
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
			return;
		}
		currentPage = 'afterSend';
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
	<Tabs.Root value={currentPage} class="mt-8 w-[400px]">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="beforeSend">Nulstil kode</Tabs.Trigger>
			<Tabs.Trigger disabled={true} value="afterSend">bekræftelse</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="beforeSend">
			<Card.Root>
				<Card.Header>
					<Card.Title>Skriv din e-mail</Card.Title>
					<Card.Description>
						Vi sender dig en e-mail med et link til at nulstille din adgangskode.
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-2">
					<div class="space-y-1">
						<Label for="firstname">Fornavn</Label>
						<Input id="firstname" placeholder="example@gmail.com" bind:value={email} />
					</div>
				</Card.Content>
				<Card.Footer class="justify-end">
					<Button disabled={!email || !validateEmail(email)} on:click={sendResetEmail}
						>Send nulstil link</Button
					>
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>
		<Tabs.Content value="afterSend">
			<Card.Root>
				<Card.Header>
					<Card.Title>E-mail send!</Card.Title>
					<Card.Description>
						Vi har sendt en e-mail til {email} med et link til at nulstille din adgangskode. Husk at
						tjekke din spam folder.
					</Card.Description>
				</Card.Header>

				<Card.Footer class="justify-end">
					<Button href="/login">Gå tilbage til login</Button>
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>
