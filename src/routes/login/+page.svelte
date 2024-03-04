<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	export let form;

	import { enhance } from '$app/forms';
	let loading = false;

	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import { AlertTriangle, Loader2 } from 'lucide-svelte';
</script>

<div class="flex h-screen-fix lg:!bg-none" id="theme-image">
	<div
		data-flip-id="login-form"
		id="login-form"
		class=" relative z-0 flex w-full flex-col items-center justify-center gap-4 backdrop-blur-3xl lg:w-1/2"
	>
		<!-- title -->
		<div class="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-background p-8">
			{#if form?.serverError}
				<Alert.Root variant="destructive" class="w-full max-w-md border-red-500 text-red-500">
					<AlertTriangle class="h-4 w-4 " />
					<Alert.Title>Fejl:</Alert.Title>
					<Alert.Description>{form?.serverError}</Alert.Description>
				</Alert.Root>
			{/if}
			<form
				method="POST"
				class="flex w-full max-w-md flex-col items-center justify-center gap-4"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						update();
					};
				}}
			>
				<h1 class="text-4xl font-bold">Log ind</h1>
				<p class="text-center text-sm text-muted-foreground">
					Hvis du er lærer eller vejleder, kan du logge ind på din konto.
				</p>

				<div class="flex w-full max-w-md flex-col gap-1.5">
					<Label for="email">E-mail</Label>
					<Input
						name="email"
						autocomplete="on"
						value={form?.formData?.email}
						type="email"
						id="email"
						placeholder="bruger@example.com"
					/>
					{#if form?.validationErrors?.email}
						<span class="label-text-alt text-red-500">{form?.validationErrors?.email[0]}</span>
					{/if}
				</div>
				<div class="flex w-full max-w-md flex-col gap-1.5">
					<Label for="password">Adgangskode</Label>
					<Input
						name="password"
						autocomplete="on"
						type="password"
						id="password"
						placeholder="Pa@$$w0rd"
					/>
					{#if form?.validationErrors?.password}
						<span class="label-text-alt text-red-500">{form?.validationErrors?.password[0]}</span>
					{/if}
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
{#if loading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<Loader2 class="h-20 w-20 animate-spin text-primary" />
	</div>
{/if}
