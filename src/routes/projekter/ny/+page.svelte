<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ChevronsUpDown, Trash, XIcon } from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { tick } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';

	import type { Project, ProjectAuthor, Profession, User } from '$lib/types';
	import { onMount } from 'svelte';
	$: console.log(projektInfo);

	let projektInfo = {
		title: '',
		description: '',
		authors: [] as { user: User; authority_level: number }[],
		subjects: [] as string[],
		resources: [],
		professions: {
			'It-supporter': {
				active: false,
				skill_level: ''
			},
			'Datatekniker programmering': {
				active: false,
				skill_level: ''
			},
			'Datatekniker infrastruktur': {
				active: false,
				skill_level: ''
			}
		}
	};

	//save the project to localstorage so the user can continue later
	let loaded = false;
	let users = (data.users as User[]) || undefined;

	onMount(() => {
		loaded = true;
		if (localStorage.getItem('projectInfo')) {
			const raw = localStorage.getItem('projectInfo');
			if (!raw) return;
			const json = JSON.parse(raw);
			projektInfo = json;
			//remove users that are already in projektInfo.authors
			if (users) {
				users = users.filter((user) => {
					let found = false;
					projektInfo.authors.forEach((author) => {
						if (author.user.id === user.id) {
							found = true;
						}
					});
					return !found;
				});
			}
			users = users || [];
		}
	});
	$: if (loaded) {
		localStorage.setItem('projectInfo', JSON.stringify(projektInfo));
	}

	let open = false;

	function closeAndFocusTriggerAuthors(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
	import * as Select from '$lib/components/ui/select';
	const permissions = [
		{ value: 0, label: 'Læse' },
		{ value: 1, label: 'Læse og skrive' },
		{ value: 2, label: 'Administrator' }
	];
	let subjectInputValue = '';
	let error = '';
</script>

<main class="mb-16 flex flex-col gap-8 p-2 sm:p-8">
	<div class="mx-auto">
		<h1 class="text-4xl font-semibold">Opret et nyt projekt.</h1>
		<p class="text mt-2">Udfyld alle felterne, og tryk på offentliggør for at lægge det op.</p>

		<form
			class=" mt-8 flex w-full max-w-lg flex-col gap-12"
			on:submit|preventDefault={() => {
				console.log('outer form');
			}}
		>
			<!-- ? title -->
			<div class="flex w-full flex-col gap-1.5">
				<Label for="title" class="text-lg">Title</Label>
				<Input bind:value={projektInfo.title} type="title" id="title" placeholder="Title" />
				<p class="text-sm text-muted-foreground">Titlen på projektets.</p>
			</div>
			<!-- ? description -->
			<div class="flex w-full flex-col gap-1.5">
				<Label class="text-lg" for="description">Description</Label>
				<Textarea bind:value={projektInfo.description} id="description" placeholder="Description" />
				<p class="text-sm text-muted-foreground">
					En kort forklaring af projektet. Hvad handler det om?
				</p>
			</div>
			<!-- ? professions -->
			<div>
				<Label class="text-lg" for="profession-section">Uddannelser</Label>
				<div class="flex flex-col gap-4 sm:gap-2">
					<div
						id="profession-section"
						class="flex flex-col items-start justify-between space-x-2 sm:flex-row sm:items-center"
					>
						<div>
							<Checkbox
								bind:checked={projektInfo.professions['It-supporter'].active}
								id="it-supporter"
								aria-labelledby="It-supporter-label"
							/>
							<Label
								id="it-supporter-label"
								for="it-supporter"
								class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								It-supporter
							</Label>
						</div>
						<div class="mt-2 flex w-full max-w-56 flex-col gap-1.5 sm:mt-0">
							<Label for="it-supporter-niveau">Niveau</Label>
							<Input
								bind:value={projektInfo.professions['It-supporter'].skill_level}
								disabled={!projektInfo.professions['It-supporter'].active}
								type="text"
								id="it-supporter-niveau"
								placeholder="H2 eller GF1"
							/>
						</div>
					</div>
					<div
						id="profession-section"
						class="flex flex-col items-start justify-between space-x-2 sm:flex-row sm:items-center"
					>
						<div>
							<Checkbox
								bind:checked={projektInfo.professions['Datatekniker programmering'].active}
								id="programmering"
								aria-labelledby="programmering-label"
							/>
							<Label
								id="programmering-label"
								for="programmering"
								class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Datatekniker med speciale i programmering
							</Label>
						</div>
						<div class="mt-2 flex w-full max-w-56 flex-col gap-1.5 sm:mt-0">
							<Label for="niveau">Niveau</Label>
							<Input
								bind:value={projektInfo.professions['Datatekniker programmering'].skill_level}
								disabled={!projektInfo.professions['Datatekniker programmering'].active}
								type="programmering-niveau"
								id="programmering-niveau"
								placeholder="H2 eller GF1"
							/>
						</div>
					</div>
					<div
						id="profession-section"
						class="flex flex-col items-start justify-between space-x-2 sm:flex-row sm:items-center"
					>
						<div>
							<Checkbox
								bind:checked={projektInfo.professions['Datatekniker infrastruktur'].active}
								id="infrastruktur"
								aria-labelledby="infrastruktur-label"
							/>
							<Label
								id="infrastruktur-label"
								for="infrastruktur"
								class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Datatekniker med speciale i infrastruktur
							</Label>
						</div>
						<div class="mt-2 flex w-full max-w-56 flex-col gap-1.5 sm:mt-0">
							<Label for="infrastruktur-niveau">Niveau</Label>
							<Input
								bind:value={projektInfo.professions['Datatekniker infrastruktur'].skill_level}
								disabled={!projektInfo.professions['Datatekniker infrastruktur'].active}
								type="niveau"
								id="infrastruktur-niveau"
								placeholder="H2 eller GF1"
							/>
						</div>
					</div>
				</div>
			</div>
			<!-- ? authors -->
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
													projektInfo.authors.push({
														user: user,
														authority_level: 0
													});
													//revome the user from the list
													users.splice(users.indexOf(user), 1);

													projektInfo = projektInfo;
													console.log('oh my goodness fam!');
													closeAndFocusTriggerAuthors(ids.trigger);
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
				{#each projektInfo.authors as author (author.user.id)}
					<div class="flex items-center justify-between gap-2 rounded-md bg-secondary p-2">
						<div class="flex items-center gap-2">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/75 text-primary-foreground"
							>
								{author.user.firstname ? author.user.firstname[0] : ''}{author.user.lastname
									? author.user.lastname[0]
									: ''}
							</div>
							<span class="ml-2 font-medium">
								{author.user.firstname}
								{author.user.lastname}
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
													projektInfo = projektInfo;
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
									projektInfo.authors.splice(projektInfo.authors.indexOf(author), 1);
									projektInfo = projektInfo;
									//add the user back to the list
									users.push(author.user);
								}}
							>
								<Trash class="h-4 w-4" />
							</Button>
						</div>
					</div>
				{/each}
			</div>
			<!-- ? subjects -->
			<div class="flex flex-col gap-4">
				<form
					on:submit|preventDefault={() => {
						error = '';
						if (subjectInputValue === '') return;
						if (projektInfo.subjects.includes(subjectInputValue)) {
							error = `${subjectInputValue} er allerede tilføjet.`;
							return;
						}
						projektInfo.subjects.push(subjectInputValue);
						subjectInputValue = '';
						projektInfo = projektInfo;
					}}
				>
					<div class="flex w-full flex-col gap-1.5">
						<Label class="text-lg" for="fag">Fag</Label>
						<div class="flex gap-1">
							<Input bind:value={subjectInputValue} type="fag" id="fag" placeholder="Cisco ITN" />
							<Button
								on:click={() => {
									error = '';
									if (subjectInputValue === '') return;
									if (projektInfo.subjects.includes(subjectInputValue)) {
										error = `${subjectInputValue} er allerede tilføjet.`;
										return;
									}
									projektInfo.subjects.push(subjectInputValue);
									subjectInputValue = '';
									projektInfo = projektInfo;
								}}
								variant="secondary">Tilføj</Button
							>
						</div>
						{#if error}
							<p class="text-destructive">{error}</p>
						{/if}
					</div>
				</form>
				{#if projektInfo.subjects && projektInfo.subjects.length > 0}
					<Card.Root class="bg-secondary p-0">
						<Card.Content class="flex flex-wrap gap-2 p-2">
							{#each projektInfo.subjects as subject (subject)}
								<Button
									class="items-center shadow-md"
									on:click={() => {
										projektInfo.subjects.splice(projektInfo.subjects.indexOf(subject), 1);
										projektInfo = projektInfo;
									}}
									>{subject}
									<XIcon class="h-4 w-4 translate-x-2"></XIcon>
								</Button>
							{/each}
						</Card.Content>
					</Card.Root>
				{/if}
			</div>
		</form>
	</div>
</main>
