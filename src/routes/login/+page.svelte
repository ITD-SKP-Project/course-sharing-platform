<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	import { page } from '$app/stores';
	import future from '$lib/img/future.webp';
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
			error = 'invalid email';
			return;
		}

		const response = await fetch('/api/login', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ password, email })
		});
		if (!response.ok) {
			error = response.statusText;
			const data = JSON.parse(await response.text());
			errorMessage = data.message;
			return;
		}
		redirect();
	}
	function redirect() {
		const redirectTo = $page.url.searchParams.get('redirect');
		if (redirectTo) {
			console.log('redirecting to', '/' + redirectTo.slice(1));
			goto('/' + redirectTo.slice(1));
		} else {
			console.log('redirecting to', '/');
			goto('/konto');
		}
	}
</script>

<div class="h-screen-fix flex">
	<div class="flex w-full flex-col items-center justify-center gap-4 lg:w-1/2">
		<!-- title -->
		<h1 class="text-4xl font-bold">Log ind</h1>
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
				Har du ikke en konto?
				<a href="/signup" class="text-primary hover:underline"> Opret en her </a>
			</p>
		</div>
		<!-- glemt kode -->
		<div class="flex w-full max-w-md flex-col gap-1.5">
			<p class="text-center">
				Glemt din kode?
				<a href="/reset-password" class="text-red-500 hover:underline">Nulsti</a>
			</p>
		</div>
	</div>
	<img src={future} alt="city" class="hidden w-1/2 max-w-[60rem] object-cover lg:block" />
</div>
