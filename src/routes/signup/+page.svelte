<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import { AlertTriangle } from 'lucide-svelte';
	import { goto } from '$app/navigation';

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
		if (!response.ok) {
			error = response.statusText;
			const data = await response.json();
			errorMessage = data.message;
		} else {
			goto('/signup/bekraeft-email');
		}
	}
</script>

<div class="flex h-screen-fix lg:!bg-none" id="theme-image">
	<!-- <img src={future} alt="city" class="hidden w-1/2 max-w-[60rem] object-cover lg:block" /> -->
	<div
		data-flip-id="theme-image"
		id="theme-image"
		class="relative z-10 hidden w-1/2 max-w-[60rem] object-cover lg:block"
	></div>
	<div
		data-flip-id="login-form"
		id="login-form"
		class="relative z-0 flex w-full flex-col items-center justify-center gap-4 backdrop-blur-3xl lg:w-1/2"
	>
		<div class="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-background p-8">
			{#if error}
				<Alert.Root variant="destructive" class="w-full max-w-md border-red-500 text-red-500">
					<AlertTriangle class="h-4 w-4 " />
					<Alert.Title>Fejl: {error}</Alert.Title>
					<Alert.Description>{errorMessage}</Alert.Description>
				</Alert.Root>
			{/if}
			<form on:submit={submit} class="flex w-full flex-col items-center justify-center gap-4">
				<h1 class="text-4xl font-bold">Opret en konto</h1>
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
</div>
