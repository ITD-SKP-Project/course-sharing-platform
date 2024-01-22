<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	import { page } from '$app/stores';

	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import { AlertTriangle, User } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { user } from '$lib/index';
	import type { User as UserType } from '$lib/types';

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

		//validate email
		if (!validateEmail(email)) {
			error = 'invalid email';
			return;
		}

		//send request to server
		const response = await fetch('/api/login', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ password, email })
		});

		//if response is not ok, set error and errorMessage
		if (!response.ok) {
			error = response.statusText;
			const data = await response.json();
			errorMessage = data.message;
			return;
		}

		//if response is ok, set user and redirect
		const { user: user_, redirectTo } = (await response.json()) as {
			user: UserType;
			redirectTo: string | null; //the server may specify a redirect url
		};
		//set user store to update the ui
		user.set(user_);
		//redirect
		redirect(redirectTo);
	}
	function redirect(location: string | null = null) {
		const redirectTo = location ?? $page.url.searchParams.get('redirect');
		if (redirectTo) {
			goto('/' + redirectTo.slice(1));
		} else {
			goto('/konto');
		}
	}
</script>

<div class="flex h-screen-fix lg:!bg-none" id="theme-image">
	<div
		data-flip-id="login-form"
		id="login-form"
		class=" relative z-0 flex w-full flex-col items-center justify-center gap-4 backdrop-blur-3xl lg:w-1/2"
	>
		<!-- title -->
		<div class="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-background p-8">
			{#if error}
				<Alert.Root variant="destructive" class="w-full max-w-md border-red-500 text-red-500">
					<AlertTriangle class="h-4 w-4 " />
					<Alert.Title>Fejl: {error}</Alert.Title>
					<Alert.Description>{errorMessage}</Alert.Description>
				</Alert.Root>
			{/if}
			<form
				on:submit={submit}
				class=" flex w-full max-w-md flex-col items-center justify-center gap-4"
			>
				<h1 class="text-4xl font-bold">Log ind</h1>

				<div class="flex w-full max-w-md flex-col gap-1.5">
					<Label for="email">E-mail</Label>
					<Input
						autocomplete="on"
						bind:value={email}
						type="email"
						id="email"
						placeholder="bruger@example.com"
					/>
				</div>
				<div class="flex w-full max-w-md flex-col gap-1.5">
					<Label for="password">Adgangskode</Label>
					<Input
						autocomplete="on"
						bind:value={password}
						type="password"
						id="password"
						placeholder="Pa@$$w0rd"
					/>
				</div>
				<Button type="submit" class="mx-auto w-full max-w-md">Log ind</Button>
			</form>
			<div class="mt-2 flex w-full max-w-md flex-col gap-1.5">
				<p class="text-center">
					Har du ikke en konto?
					<a href="/signup" class="text-primary hover:underline"> Opret en her </a>
				</p>
			</div>
			<!-- glemt kode -->
			<div class="flex w-full max-w-md flex-col gap-1.5">
				<p class="text-center">
					Glemt din kode?
					<a href="/nulstil-adgangskode" class="text-primary hover:underline">Nulstil</a>
				</p>
			</div>
		</div>
	</div>
	<div
		data-flip-id="theme-image"
		id="theme-image"
		class="relative z-10 hidden w-1/2 max-w-[60rem] object-cover lg:block"
	></div>
	<!-- <img src={future} alt="city" class="hidden w-1/2 max-w-[60rem] object-cover lg:block" /> -->
</div>
