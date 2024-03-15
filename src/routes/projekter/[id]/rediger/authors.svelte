<script lang="ts">
	export let FieldToEdit: ProjectEditMode;
	export let loading: boolean = false;
	export let project: Project;
	export let form: any;
	export let users: UserEssentials[];

	export let currentUser: User;

	import { Save, Trash, Pen, ChevronsUpDown, Check, X } from 'lucide-svelte';
	import type { Project, User, UserEssentials } from '$lib/types';
	import DisplayFormUser from './displayFormUser.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import * as Command from '$lib/components/ui/command';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { ProjectEditMode } from '$lib/types';
	import { enhance } from '$app/forms';
	import { cn } from '$lib/utils';
	import { tick } from 'svelte';
	let usersAdded: UserEssentials[] = [];

	// let indexOfCurrentUser = users.findIndex((f) => f.id === currentUser.id);
	// let usersToBeAdded: UserEssentials[] = users.splice(indexOfCurrentUser, 1);

	//add the users that are already added to the usersAdded array
	function resetUsersAdded() {
		usersAdded = [];
		project.authors?.forEach((author) => {
			if (author.user && author.user?.id != currentUser.id) {
				usersAdded.push(author.user);
				users = users.filter((f) => f.id !== author.user?.id);
			}
		});
	}
	resetUsersAdded();

	let open = false;
	let value = '';

	function getFullName(user: UserEssentials | undefined): string | null {
		if (!user) return null;
		return user.firstname + ' ' + user.lastname;
	}
	$: selectedValue =
		getFullName(users.find((f: UserEssentials) => f.id.toString() === value)) ?? 'Vælg en bruger..';

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	import { createEventDispatcher } from 'svelte';
	import { toArrayOfStrings } from '$lib';

	const dispatch = createEventDispatcher();
</script>

{#key FieldToEdit}
	{#if ProjectEditMode.authors === FieldToEdit}
		<form
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					dispatch('update');
					update();
				};
			}}
			class="flex w-full flex-col gap-2"
			method="POST"
			action="?/updateAuthors"
		>
			<Label for="users" class="text-lg">Medforfattere</Label>
			<Popover.Root bind:open let:ids>
				<Popover.Trigger asChild let:builder>
					<Button
						builders={[builder]}
						variant="outline"
						role="combobox"
						aria-expanded={open}
						class="w-[200px] justify-between bg-card text-card-foreground"
					>
						{selectedValue}
						<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</Popover.Trigger>
				<Popover.Content class="w-[200px] bg-card p-0 text-card-foreground">
					<Command.Root>
						<Command.Input placeholder="Søg efter bruger..." />
						<Command.Empty>Ingen brugere fundet.</Command.Empty>
						<Command.Group>
							{#each users as user}
								<Command.Item
									value={user.id.toString()}
									onSelect={(currentValue) => {
										value = currentValue;
										// @ts-ignore
										//move user to the added users array
										usersAdded.push(users.find((f) => f.id.toString() === value));
										users = users.filter((f) => f.id.toString() !== value);
										users = users;
										usersAdded = usersAdded;
										closeAndFocusTrigger(ids.trigger);
									}}
								>
									<Check
										class={cn('mr-2 h-4 w-4', value !== user.id.toString() && 'text-transparent')}
									/>
									{user.firstname}
									{user.lastname}
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
			<p class="text-sm text-primary-foreground">
				Hvem har været med til at lave projektet ud over dig selv?
			</p>
			{#each usersAdded as user, index}
				<Button
					id="users-{index}"
					variant="outline"
					class="w-fit gap-4 bg-card text-card-foreground"
					on:click={() => {
						users.push(user);
						usersAdded = usersAdded.filter((f) => f.id !== user.id);
						users = users;
						usersAdded = usersAdded;
						value = '';
						const target = document.querySelector(`#users-${index}`);
						target?.remove();
					}}
				>
					{user.firstname}
					{user.lastname}
					<X
						on:click={() => {
							users.push(user);
							usersAdded = usersAdded.filter((f) => f.id !== user.id);
							users = users;
							usersAdded = usersAdded;
						}}
						class="h-4 w-4"
					/>
					<input
						value={usersAdded[index]?.id ?? form?.formData[`users-${index}`] ?? ''}
						type="text"
						name="users-{index}"
						class="hidden"
					/>
				</Button>
			{/each}
			<div class="flex flex-col gap-2">
				<div class="mt-2 flex items-center gap-2">
					<Label for="resources" class="text-lg">Forfattere</Label>
					<Button
						size="icon"
						variant="destructive"
						on:click={() => {
							FieldToEdit = ProjectEditMode.none;

							//add the users back to the users array
							users = users.concat(usersAdded);
							users = users;

							//reset the usersAdded array
							resetUsersAdded();

							//reset the value
							value = '';
						}}
					>
						<Trash class="h-5 w-5" />
					</Button>
					<Button
						size="icon"
						class="bg-green-500 hover:bg-green-600 focus:ring-green-500"
						type="submit"
					>
						<Save class="h-5 w-5" />
					</Button>
				</div>
			</div>
		</form>
	{:else}
		<div>
			<div class="flex items-center">
				<span class=" text-sm font-semibold text-primary-foreground/75">Forfattere</span>
				<Button
					size="icon"
					variant="ghost"
					on:click={() => {
						FieldToEdit = ProjectEditMode.authors;
					}}
				>
					<Pen class="h-5 w-5" />
				</Button>
			</div>
			<div
				id="authors"
				class="p.2 mt-1 flex w-full flex-col flex-wrap gap-x-2 gap-y-2 rounded-md border-secondary"
			>
				{#key form}
					{#if toArrayOfStrings(form?.formData, 'users').length > 0}
						{#each toArrayOfStrings(form?.formData, 'users-') as id}
							<DisplayFormUser {users} {id} />
						{/each}
					{:else if project.authors && project.authors.length > 0}
						{#each project.authors as author}
							{#if author?.user}
								<a href="/?forfatter={author.user.firstname}-{author.user.lastname}">
									<div class="flex min-w-max items-center gap-2">
										<div
											class="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/75 text-secondary-foreground"
										>
											{author.user.firstname ? author.user.firstname[0] : ''}{author.user.lastname
												? author.user.lastname[0]
												: ''}
										</div>
										<span class="ml-2 font-medium"
											>{author.user.firstname}
											{author.user.lastname}
										</span>
									</div>
								</a>
							{/if}
						{/each}
					{/if}
				{/key}
			</div>
		</div>
	{/if}
{/key}
