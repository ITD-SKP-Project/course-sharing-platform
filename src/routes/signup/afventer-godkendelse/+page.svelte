<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	import { Pencil2 } from 'radix-icons-svelte';
</script>

<main class="mb-48 flex min-h-96 flex-col items-center px-4">
	<h1 class="text-4xl font-bold">Afventer godkendelse</h1>
	<p class="mt-2 text-foreground/80">
		tak for din tilmelding. Du vil modtage en email når din konto er godkendt.
	</p>

	<h2 class="mt-16 text-2xl font-bold">Inroduktions guide</h2>
	<div class="g grid w-full gap-8">
		<Card.Root>
			<Card.Header>
				<Card.Title>Opret projekter</Card.Title>
				<Card.Description>Når du er godkendt kan du begynde at oprette projekter</Card.Description>
			</Card.Header>
			<Card.Content>
				Tryk på
				<Badge variant="secondary">Opret projekt</Badge>
				øverst på hjem siden for at oprette et projekt.
			</Card.Content>
			<Card.Footer class="justify-end"></Card.Footer>
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Samarbejd i projekter</Card.Title>
				<Card.Description>Det er muligt at tilføje flere forfattere på et projekt.</Card.Description
				>
			</Card.Header>
			<Card.Content>
				Forfatteren som har oprettet projektet, kan tilføje andre forfattere.
			</Card.Content>
			<Card.Footer class="justify-end"></Card.Footer>
		</Card.Root>
	</div>
</main>

<style>
	.g {
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
	}
</style>
