<script lang="ts">
	import { Label } from '../ui/label';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { ChevronsUpDown, Trash } from 'lucide-svelte';
	import type { ProjectAuthorCreation, User } from '$lib/types';

	let loaded = false;
	export let projectAuthors: ProjectAuthorCreation[] = []; //users that are already added to the project
	export let users: User[]; //users that can be added to the project
	let removedUsers: User[] = []; //users that have been added to the project and therefore removed from the list of users that can be added
	let open = false;

	import { tick } from 'svelte';
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	const permissions = [
		{ value: 0, label: 'Læse' },
		{ value: 1, label: 'Læse og skrive' },
		{ value: 2, label: 'Administrator' }
	];

	import { onMount } from 'svelte';

	onMount(() => {
		loaded = true;
		if (localStorage.getItem('projectAuthors')) {
			const raw = localStorage.getItem('projectAuthors');
			if (!raw) return;
			const json = JSON.parse(raw);
			//validate the data
			if (!Array.isArray(json)) return;
			for (const author of json) {
				if (!author.user_id || !author.authority_level) return;
			}

			projectAuthors = json;
			//for each author, remove the user from the list of users that can be added
			if (users && users.length >= projectAuthors.length) {
				for (const author of projectAuthors) {
					const removedUser = users.find((u) => {
						return u.id === author.user_id;
					});
					if (removedUser) {
						users.splice(users.indexOf(removedUser), 1);
						removedUsers.push(removedUser);
					}
				}
			}
			users = users || [];
		}
	});

	$: if (loaded) {
		localStorage.setItem('projectAuthors', JSON.stringify(projectAuthors));
	}
</script>

<div class="flex flex-col gap-4">
	<Label class="text-lg" for="description">Forfattere</Label>
	<div>
		{#if users}
			<Popover.Root bind:open let:ids>
				<Popover.Trigger asChild let:builder>
					<Button
						builders={[builder]}
						variant="outline"
						role="combobox"
						aria-expanded={open}
						class="w-[200px] justify-between"
					>
						Tilføj forfattere
						<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</Popover.Trigger>
				<Popover.Content class="w-[200px] p-0">
					<Command.Root>
						<Command.Input placeholder="Search framework..." />
						<Command.Empty>No framework found.</Command.Empty>
						<Command.Group>
							{#each users as user}
								<Command.Item
									value={user.firstname + ' ' + user.lastname}
									onSelect={() => {
										projectAuthors.push({
											user_id: user.id,
											authority_level: 1,
											project_id: null
										});
										//revome the user from the list
										const removedUser = users.splice(users.indexOf(user), 1); //removes the user from the list of users that can be added
										removedUsers.push(removedUser[0]);
										projectAuthors = projectAuthors; //updates UI
										closeAndFocusTrigger(ids.trigger);
									}}
								>
									{user.firstname + ' ' + user.lastname}
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
			<p class="mt-1 text-sm text-muted-foreground">
				Tilføj personer som har været med til at lave projektet.
			</p>
		{/if}
	</div>
	{#each projectAuthors as author (author.user_id)}
		<div class="flex items-center justify-between gap-2 rounded-md bg-secondary p-2">
			<div class="flex items-center gap-2">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/75 text-primary-foreground"
				>
					{removedUsers.find((u) => {
						return u.id === author.user_id;
					})?.firstname?.[0] || ''}{removedUsers.find((u) => {
						return u.id === author.user_id;
					})?.lastname?.[0] || ''}
				</div>
				<span class="ml-2 font-medium">
					{removedUsers.find((u) => {
						return u.id === author.user_id;
					})?.firstname}
					{removedUsers.find((u) => {
						return u.id === author.user_id;
					})?.lastname}
				</span>
			</div>

			<div class="flex gap-1">
				<Select.Root>
					<Select.Trigger class="w-[180px]">
						<Select.Value placeholder="Rettigheder" />
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label>Niveau</Select.Label>
							{#each permissions as permission}
								<Select.Item
									on:click={() => {
										author.authority_level = permission.value;
										projectAuthors = projectAuthors;
									}}
									value={permission.value}
									label={permission.label}>{permission.label}</Select.Item
								>
							{/each}
						</Select.Group>
					</Select.Content>
					<Select.Input name="favoriteFruit" />
				</Select.Root>
				<Button
					size="icon"
					variant="ghost"
					on:click={() => {
						projectAuthors.splice(projectAuthors.indexOf(author), 1);
						projectAuthors = projectAuthors;
						//add the user back to the list
						const removedUser = removedUsers.find((u) => {
							return u.id === author.user_id;
						});
						if (removedUser) {
							users.push(removedUser);
						}
					}}
				>
					<Trash class="h-4 w-4" />
				</Button>
			</div>
		</div>
	{/each}
</div>
