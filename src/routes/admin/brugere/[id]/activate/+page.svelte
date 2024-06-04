<script lang="ts">
	import type { PageData } from './$types';
	//page store
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { formatCommentTimePosted } from '$lib';
	import { Quote } from 'lucide-svelte';

	export let data: PageData;
	console.log('🚀 ~ data:', data);

	let loaded = false;
	onMount(() => {
		loaded = true;
	});
	async function activateUser() {
		const res = await fetch(`/api/users/activate?ids=${JSON.stringify([data.user?.id])}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (res.ok) {
			//put message in local storage
			if (loaded)
				localStorage.setItem('toast', JSON.stringify({ title: 'Brugeren/e er blevet aktiveret.' }));
			window.location.href = '/admin/brugere';
		} else {
			const json = await res.json();
			toast('Der skete en fejl', {
				description: json.message,
				duration: 5000
			});
		}
	}

	async function deleteUser() {
		const res = await fetch(`/api/users/delete?ids=${JSON.stringify([data.user?.id])}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (res.ok) {
			if (loaded)
				localStorage.setItem(
					'toast',
					JSON.stringify({
						title: 'Der skete en fejl',
						description: 'Ingen brugere blev deaktiveret.'
					})
				);
			window.location.href = '/admin/brugere';
		} else {
			const json = await res.json();
			toast('Der skete en fejl', {
				description: json.message,
				duration: 5000
			});
		}
	}
</script>

<main class="mb-16 flex flex-col gap-8 p-2 sm:p-8">
	<h1 class="text-2xl font-bold">Aktiver bruger</h1>
	{#if data.user?.validated}
		<div class="flex flex-col items-center justify-center">
			<p class="mt-4 text-center">Brugeren er allerede blevet aktiveret.</p>
			<p>
				Sidste ændring af brugeren skete for {formatCommentTimePosted(data.user?.updated_at)} siden.
			</p>
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Fornavn</Table.Head>
						<Table.Head>Efternavn</Table.Head>
						<Table.Head>Email</Table.Head>
						<Table.Head>Email valideret</Table.Head>
						<Table.Head>Aktiveret</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					<Table.Row>
						<Table.Cell>{data.user?.firstname}</Table.Cell>
						<Table.Cell>{data.user?.lastname}</Table.Cell>
						<Table.Cell>{data.user?.email}</Table.Cell>
						<Table.Cell>{data.user?.email_verified ? 'Ja' : 'Nej'}</Table.Cell>
						<Table.Cell>{data.user?.validated ? 'Ja' : 'Nej'}</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root>
			<Card.Root class="mr-auto mt-8 w-fit max-w-[100vw]">
				<Card.Header>
					<Card.Title>Beskrivelse</Card.Title>
					<Card.Description>Sådan her beskrev brugeren sig selv under oprettelsen.</Card.Description
					>
				</Card.Header>
				<Card.Content>
					<Quote />

					<p>{data.user?.context}</p>
					<Quote class="ml-auto rotate-180" />
				</Card.Content>
				<Card.Footer>
					<div class="flex gap-4">
						<AlertDialog.Root>
							<AlertDialog.Trigger asChild let:builder>
								<Button builders={[builder]} class="px-4" variant="destructive">Slet</Button>
							</AlertDialog.Trigger>
							<AlertDialog.Content>
								<AlertDialog.Header>
									<AlertDialog.Title
										>Er du sikker på du vil slette denne bruger permanent?</AlertDialog.Title
									>
									<AlertDialog.Description>
										Dette kan ikke fortrydes. Alle brugerens data vil blive slettet permanent.
									</AlertDialog.Description>
								</AlertDialog.Header>

								<AlertDialog.Footer class="m-0 w-full p-0">
									<div class="flex w-full flex-col">
										<div class="flex w-48 flex-col gap-2">
											<div class=" mr-auto flex flex-row">
												<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
												<AlertDialog.Action asChild let:builder>
													<Button builders={[builder]} on:click={deleteUser} variant="destructive"
														>Slet forevigt</Button
													>
												</AlertDialog.Action>
											</div>
										</div>
									</div>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>
						<Button on:click={activateUser} class="mr-2">Aktiver</Button>
					</div>
				</Card.Footer>
			</Card.Root>
		</div>
	{/if}
</main>
