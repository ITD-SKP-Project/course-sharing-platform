<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	export let form;

	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import { AlertTriangle } from 'lucide-svelte';
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
			<form method="POST" class=" flex w-full max-w-md flex-col items-center justify-center gap-4">
				<h1 class="text-4xl font-bold">Nulstil adgangskode</h1>

				<div class="flex w-full max-w-md flex-col gap-1.5">
					<Label for="password">Ny adgangskode</Label>
					<Input
						autocomplete="on"
						type="password"
						id="password"
						placeholder="Pa@$$w0rd"
						name="password"
					/>
					{#if form?.validationErrors?.password}
						<p class="text-red-500">{form?.validationErrors?.password}</p>
					{/if}
				</div>
				<div class="flex w-full max-w-md flex-col gap-1.5">
					<Label for="passwordConfirm">Gentag adgangskode</Label>
					<Input
						autocomplete="on"
						type="password"
						id="passwordConfirm"
						placeholder="Pa@$$w0rd"
						name="passwordConfirm"
					/>
					{#if form?.validationErrors?.passwordConfirm}
						<p class="text-red-500">{form?.validationErrors?.passwordConfirm}</p>
					{/if}
				</div>
				<div class="hidden">
					<Label for="token">Token</Label>
					<Input value={data.token} type="text" id="token" name="token" />
				</div>
				<Button type="submit" class="mx-auto w-full max-w-md">Opdater adgangskode</Button>
			</form>
		</div>
	</div>
	<div
		data-flip-id="theme-image"
		id="theme-image"
		class="relative z-10 hidden w-1/2 max-w-[60rem] object-cover lg:block"
	></div>
</div>
