<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import { AlertTriangle, User } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	let error = '';
	let errorMessage = '';

	let newPassword1 = '';
	let newPassword2 = '';
	1;

	async function resetPassword() {}
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
				on:submit={resetPassword}
				class=" flex w-full max-w-md flex-col items-center justify-center gap-4"
			>
				<h1 class="text-4xl font-bold">Nulstil adgangskode</h1>

				<div class="flex w-full max-w-md flex-col gap-1.5">
					<Label for="password1">Ny adgangskode</Label>
					<Input
						autocomplete="on"
						bind:value={newPassword1}
						type="password1"
						id="password1"
						placeholder="Pa@$$w0rd"
					/>
				</div>
				<div class="flex w-full max-w-md flex-col gap-1.5">
					<Label for="password2">Gentag adgangskode</Label>
					<Input
						autocomplete="on"
						bind:value={newPassword1}
						type="password2"
						id="password2"
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
					<a href="/reset-password" class="text-primary hover:underline">Nulstil</a>
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
