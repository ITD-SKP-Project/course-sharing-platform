<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	export let form;
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';

	let context = '';
	let pages = ['name', 'description'];

	//if there are validation errors, set the current page to the first page with errors
	let currentPage =
		form?.validationErrors?.firstname || form?.validationErrors?.lastname
			? pages[0]
			: form?.validationErrors?.lastname
				? pages[1]
				: pages[0];
</script>

<main class="flex flex-col items-center justify-center px-4">
	<h1 class="text-primar mb-2 text-4xl font-bold">Velkommen</h1>
	<h2>Før du kan begynde at oprette projekter, skal vi lige vide lidt mere om dig.</h2>

	<Tabs.Root value={currentPage} class="mt-8 w-[400px]">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value={pages[0]}>Navn</Tabs.Trigger>
			<Tabs.Trigger value={pages[1]}>Beskrivelse</Tabs.Trigger>
		</Tabs.List>

		<form method="POST">
			<Tabs.Content value="name">
				<Card.Root>
					<Card.Header>
						<Card.Title>Hvad er dit navn?</Card.Title>
						<Card.Description>
							Det er det navn, som andre brugere vil se på dine projekter.
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-2">
						<div class="space-y-1">
							<Label for="firstname">Fornavn</Label>
							<Input
								name="firstname"
								id="firstname"
								placeholder="Mads"
								value={form?.formData?.firstname}
							/>
							{#if form?.validationErrors?.firstname}
								<span class="label-text-alt text-red-500"
									>{form?.validationErrors?.firstname[0]}</span
								>
							{/if}
						</div>
						<div class="space-y-1">
							<Label for="lastname">Efternavn</Label>
							<Input
								name="lastname"
								id="lastname"
								placeholder="Madsen"
								value={form?.formData?.lastname}
							/>
							{#if form?.validationErrors?.lastname}
								<span class="label-text-alt text-red-500"
									>{form?.validationErrors?.lastname[0]}</span
								>
							{/if}
						</div>
					</Card.Content>
					<Card.Footer class="justify-end">
						<Button
							on:click={() => {
								currentPage = pages[1];
							}}>Fortsæt</Button
						>
					</Card.Footer>
				</Card.Root>
			</Tabs.Content>
			<Tabs.Content value="description">
				<Card.Root>
					<Card.Header>
						<Card.Title>Fortæl om dig selv.</Card.Title>
						<Card.Description>
							Fordi vores system kun er for lærere og vejledere, vil vi gerne vide lidt om dig. Hvad
							er din nuværende stilling og Hvor arbejder du? Dette vil kun være synligt for
							administatorer som skal godkende din konto.
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-2">
						<span class="text-xs text-foreground"
							>{context.length || form?.formData?.context?.length} ud af 50 - 250</span
						>
						<Textarea
							on:input={(e) => {
								context = e.target.value || '';
							}}
							name="context"
							value={form?.formData?.context}
							class="min-h-44"
							placeholder="Den besked her"
						/>
						{#if form?.validationErrors?.context}
							<span class="label-text-alt text-red-500">{form?.validationErrors?.context[0]}</span>
						{/if}
					</Card.Content>
					<Card.Footer class="justify-end">
						<Button type="submit">Send ansøgning</Button>
					</Card.Footer>
				</Card.Root>
			</Tabs.Content>
		</form>
	</Tabs.Root>
</main>
