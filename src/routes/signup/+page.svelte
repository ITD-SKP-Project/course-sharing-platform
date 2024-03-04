<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	export let form;

	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import { AlertTriangle } from 'lucide-svelte';

	import { enhance } from '$app/forms';
	import { Loader2 } from 'lucide-svelte';
	let loading = false;
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
			{#if form?.error}
				<Alert.Root variant="destructive" class="w-full max-w-md border-red-500 text-red-500">
					<AlertTriangle class="h-4 w-4 " />
					<Alert.Title>Fejl: {form?.error}</Alert.Title>
				</Alert.Root>
			{/if}
			<form
				method="POST"
				class="flex w-full flex-col items-center justify-center gap-4"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						update();
					};
				}}
			>
				<h1 class="text-4xl font-bold">Opret en konto</h1>
				<p class="text-center text-sm text-muted-foreground">
					Hvis du er lærer eller vejleder, kan du oprette en konto. Herefter kan du oprette
					projekter i systemet.
				</p>

				<div class="flex w-full max-w-md flex-col gap-1.5">
					<Label for="email">E-mail</Label>
					<Input
						name="email"
						value={form?.data?.email ?? ''}
						type="email"
						id="email"
						placeholder="bruger@example.com"
						class={form?.errors?.email ? 'border-destructive' : ''}
					/>
					{#if form?.errors?.email}
						<span class="label-text-alt text-red-500">{form?.errors?.email[0]}</span>
					{/if}
				</div>
				<div class="flex w-full max-w-md flex-col gap-1.5">
					<Label for="password">Adgangskode</Label>
					<Input
						name="password"
						class={form?.errors?.password ? 'border-destructive' : ''}
						type="password"
						id="password"
						placeholder="Pa@$$w0rd"
					/>
					{#if form?.errors?.password}
						<span class="label-text-alt text-red-500">{form?.errors?.password[0]}</span>
					{/if}
				</div>

				<Button type="submit" class="mx-auto w-full max-w-md">Opret dig</Button>
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
{#if loading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<Loader2 class="h-20 w-20 animate-spin text-primary" />
	</div>
{/if}
