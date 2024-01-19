<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { goto } from '$app/navigation';

	let pages = ['name', 'description'];
	let currentPage = pages[0];

	let firstname = '';
	let lastname = '';
	let context = '';

	async function updateUser() {
		if (!firstname || !lastname) return;
		if (context.length < 50 || context.length > 250) return;

		const response = await fetch('/api/signup/create-user', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ firstname, lastname, context })
		});
		console.log(response, 'response');
		if (!response.ok) {
			console.log(await response.json(), response.statusText, 'response');
			return;
		}
		goto('/signup/afventer-godkendelse');
	}
</script>

<main class="flex flex-col items-center justify-center px-4">
	<h1 class="text-primar mb-2 text-4xl font-bold">Velkommen</h1>
	<h2>Før du kan begynde at oprette projekter, skal vi lige vide lidt mere om dig.</h2>

	<Tabs.Root value={currentPage} class="mt-8 w-[400px]">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="name">Navn</Tabs.Trigger>
			<Tabs.Trigger disabled={!firstname || !lastname} value="description">Beskrivelse</Tabs.Trigger
			>
		</Tabs.List>

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
						<Input id="firstname" placeholder="Mads" bind:value={firstname} />
					</div>
					<div class="space-y-1">
						<Label for="lastname">Efternavn</Label>
						<Input id="lastname" placeholder="Madsen" bind:value={lastname} />
					</div>
				</Card.Content>
				<Card.Footer class="justify-end">
					<Button
						disabled={!firstname || !lastname}
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
					<span class="text-xs text-foreground">{context.length} ud af 50 - 250</span>
					<Textarea class="min-h-44" bind:value={context} placeholder="Den besked her" />
				</Card.Content>
				<Card.Footer class="justify-end">
					<Button disabled={context.length < 50 || context.length > 250} on:click={updateUser}
						>Send ansøgning</Button
					>
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>
