<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	import future from '$lib/img/future.webp';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import { AlertTriangle } from 'lucide-svelte';

	let password = '';
	let email = '';
	let error = '';
	let errorMessage = '';

	function validateEmail(email: string) {
		const re = /\S+@\S+\.\S+/;
		return re.test(email);
	}

	async function submit() {
		error = '';
		errorMessage = '';
		if (!validateEmail(email)) {
			error = 'Skriv venligst en gyldig email.';
			return;
		}
		if (password.length < 8) {
			error = 'Adgangskoden skal være mindst 8 tegn.';
			return;
		}

		const response = await fetch('/api/signup', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ password, email })
		});
		console.log(response);
	}
</script>

<div class="flex h-screen-fix">
	<img src={future} alt="city" class="hidden w-1/2 max-w-[60rem] object-cover lg:block" />
	<div class="flex w-full flex-col items-center justify-center gap-4 lg:w-1/2">
		<h1 class="text-4xl font-bold">Opret en konto</h1>
		{#if error}
			<Alert.Root variant="destructive" class="w-full max-w-md border-red-500 text-red-500">
				<AlertTriangle class="h-4 w-4 " />
				<Alert.Title>Fejl: {error}</Alert.Title>
				<Alert.Description>{errorMessage}</Alert.Description>
			</Alert.Root>
		{/if}
		<form on:submit={submit} class="flex w-full flex-col items-center justify-center gap-4">
			<div class="flex w-full max-w-md flex-col gap-1.5">
				<Label for="email">E-mail</Label>
				<Input bind:value={email} type="email" id="email" placeholder="bruger@example.com" />
			</div>
			<div class="flex w-full max-w-md flex-col gap-1.5">
				<Label for="password">Adgangskode</Label>
				<Input bind:value={password} type="password" id="password" placeholder="Pa@$$w0rd" />
			</div>

			<Button type="submit" class="mx-auto w-full max-w-md">Log ind</Button>
		</form>
		<div class="flex w-full max-w-md flex-col gap-1.5">
			<p class="text-center">
				Har du allerede en konto?
				<a href="/login" class="text-primary hover:underline"> Log ind </a>
			</p>
		</div>
	</div>
</div>
