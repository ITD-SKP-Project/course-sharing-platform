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

	export let form;

	let pages = ['beforeSend', 'afterSend'];

	//if there are validation errors, set the current page to the first page with errors
	let currentPage =
		form?.validationErrors?.firstname || form?.validationErrors?.lastname
			? pages[0]
			: form?.success
				? pages[1]
				: pages[0];
</script>

<main class="flex flex-col items-center justify-center px-4">
	<h1 class="text-primar mb-2 text-4xl font-bold">Nulstil din adgangskode</h1>
	<!--
	<h2>Før du kan begynde at oprette projekter, skal vi lige vide lidt mere om dig.</h2> -->
	{#if form?.serverError}
		<Alert.Root variant="destructive" class="w-full max-w-md border-red-500 text-red-500">
			<AlertTriangle class="h-4 w-4 " />
			<Alert.Title>Fejl:</Alert.Title>
			<Alert.Description>{form?.serverError}</Alert.Description>
		</Alert.Root>
	{/if}
	<Tabs.Root value={currentPage} class="mt-8 w-[400px]">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger disabled={form?.success} value="beforeSend">Nulstil kode</Tabs.Trigger>
			<Tabs.Trigger disabled={!form?.success} value="afterSend">Bekræftelse</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="beforeSend">
			<form method="POST">
				<Card.Root>
					<Card.Header>
						<Card.Title>Skriv din e-mail</Card.Title>
						<Card.Description>
							Vi sender dig en e-mail med et link til at nulstille din adgangskode.
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-2">
						<div class="space-y-1">
							<Label for="email">E-mail</Label>
							<Input
								name="email"
								id="email"
								placeholder="example@gmail.com"
								value={form?.formData?.email}
							/>
							{#if form?.validationErrors?.email}
								<span class="label-text-alt text-red-500">{form?.validationErrors?.email[0]}</span>
							{/if}
						</div>
					</Card.Content>
					<Card.Footer class="justify-end">
						<Button type="submit">Send nulstil link</Button>
					</Card.Footer>
				</Card.Root>
			</form>
		</Tabs.Content>
		<Tabs.Content value="afterSend">
			<Card.Root>
				<Card.Header>
					<Card.Title>E-mail send!</Card.Title>
					<Card.Description>
						Vi har sendt en e-mail til {form?.formData?.email} med et link til at nulstille din adgangskode.
						Husk at tjekke din spam folder.
					</Card.Description>
				</Card.Header>

				<Card.Footer class="justify-end">
					<Button href="/login">Gå tilbage til login</Button>
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>
