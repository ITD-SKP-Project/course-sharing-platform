<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Input } from '$lib/components/ui/input';
	import {
		Link,
		Lock,
		Unlock,
		MoreHorizontal,
		Send,
		UserRoundX,
		MessageSquareMore
	} from 'lucide-svelte';
	export let user: UserExludingPassword;
	export let currentUser: User;
	import { Pen } from 'lucide-svelte';
	import type { User, UserExludingPassword } from '$lib/types';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';

	let showDescriptionDialog = false;
	let showDeletionDialog = false;
	let confirnDelete = '';
	let loaded = false;
	onMount(() => {
		loaded = true;
	});

	async function deleteUser() {
		console.log('delete user');
		const res = await fetch(`/api/users/delete?ids=${JSON.stringify([user.id])}`, {
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

	async function activateUser() {
		const res = await fetch(`/api/users/activate?ids=${JSON.stringify([user.id])}`, {
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
	async function deactivateUser() {
		const res = await fetch(`/api/users/deactivate?ids=${JSON.stringify([user.id])}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (res.ok) {
			//put message in local storage
			if (loaded)
				localStorage.setItem(
					'toast',
					JSON.stringify({ title: 'Brugeren/e er blevet deaktiveret.' })
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

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
			<span class="sr-only">Open menu</span>
			<MoreHorizontal class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Handlinger</DropdownMenu.Label>

			<DropdownMenu.Item
				disabled={user.context === '' || !user.context}
				class="gap-4"
				on:click={() => {
					showDescriptionDialog = true;
				}}
			>
				<MessageSquareMore class="ml-2 h-4 w-4" />
				Se beskrivelse
			</DropdownMenu.Item>
		</DropdownMenu.Group>

		<DropdownMenu.Item class="gap-4" href={'mailto:' + user.email}>
			<Send class="ml-2 h-4 w-4" />
			Send email
		</DropdownMenu.Item>
		<DropdownMenu.Item class="gap-4" href={`/?forfatter=${user.firstname}-${user.lastname}`}>
			<Link class="ml-2 h-4 w-4" />
			Se projekter
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item
			class="gap-4"
			href={`/admin/brugere/${user.id}/rediger`}
			disabled={currentUser.authority_level && user.authority_level
				? currentUser.authority_level < user.authority_level
				: false}
		>
			<Pen class="ml-2 h-4 w-4" />
			Rediger
		</DropdownMenu.Item>
		{#if user.validated}
			<DropdownMenu.Item
				on:click={deactivateUser}
				class="gap-4 "
				disabled={currentUser.authority_level && user.authority_level
					? currentUser.authority_level < user.authority_level
					: false}
			>
				<Lock class="ml-2 h-4 w-4" />
				Deaktiver
			</DropdownMenu.Item>
		{:else}
			<DropdownMenu.Item
				on:click={activateUser}
				class="gap-4 "
				disabled={currentUser.authority_level && user.authority_level
					? currentUser.authority_level < user.authority_level
					: false}
			>
				<Unlock class="ml-2 h-4 w-4" />
				Aktiver
			</DropdownMenu.Item>
		{/if}
		<DropdownMenu.Item
			disabled={currentUser.authority_level && user.authority_level
				? currentUser.authority_level < user.authority_level
				: false}
			on:click={() => {
				showDeletionDialog = true;
			}}
			class="gap-4 text-red-500 hover:!bg-red-500/50"
		>
			<UserRoundX class="ml-2 h-4 w-4" />
			Slet
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
<Dialog.Root bind:open={showDescriptionDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Sådan beskrev brugeren sig selv under oprettelsen.</Dialog.Title>
			<Dialog.Description class="relative">
				<span class="text-3xl">“</span>
				{user.context}
				<span class="text-3xl">”</span>
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="mt-4">
			<Button
				variant="secondary"
				class="mr-auto"
				on:click={() => {
					showDescriptionDialog = false;
				}}>Tilbage</Button
			>
			<Button
				on:click={() => {
					showDeletionDialog = true;
					showDescriptionDialog = false;
				}}
				variant="destructive">Slet bruger</Button
			>
			<Button type="submit">Aktiver</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
<AlertDialog.Root open={showDeletionDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title
				>Er du sikker på du vil slette denne brugers konto permanent?</AlertDialog.Title
			>
			<AlertDialog.Description>
				Dette kan ikke fortrydes. Alle brugerens data vil blive slettet permanent. Alle brugerens
				projekter vil stadig eksistere men vil ikke være tilknyttet en bruger.
			</AlertDialog.Description>
		</AlertDialog.Header>

		<AlertDialog.Footer class="m-0 w-full p-0">
			<div class="flex w-full flex-col">
				<p>
					Skriv <strong>slet bruger</strong> før du kan slette din konto.
				</p>
				<div class="flex w-48 flex-col gap-2">
					<Input class=" w-full border-destructive outline-destructive" bind:value={confirnDelete}
					></Input>
					<div class=" mr-auto flex flex-row">
						<AlertDialog.Cancel
							on:click={() => {
								showDescriptionDialog = false;
								showDeletionDialog = false;
							}}>Cancel</AlertDialog.Cancel
						>
						<AlertDialog.Action asChild let:builder>
							<Button
								disabled={confirnDelete.toLowerCase() != 'slet bruger'}
								builders={[builder]}
								on:click={deleteUser}
								variant="destructive">Slet forevigt</Button
							>
						</AlertDialog.Action>
					</div>
				</div>
			</div>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
