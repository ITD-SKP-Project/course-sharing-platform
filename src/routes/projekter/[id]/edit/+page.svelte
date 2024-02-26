<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { ChevronDown, ChevronUp, Loader2, Plus, Star, X } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Alert from '$lib/components/ui/alert';
	import { Heart, BadgeInfo, Pen, Trash, Save } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import DowdloadLink from '$lib/components/DowdloadLink.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	import type { PageData } from './$types';
	import type { Project } from '$lib/types';
	export let data: PageData;
	export let form;
	$: console.log(form, 'form');
	$: console.log(data, 'data');

	let project = data.project as Project;
	const created_at = new Date(project.created_at);
	const updated_at = new Date(project.updated_at);
	import { months } from '$lib/index';
	import { enhance } from '$app/forms';

	enum Fields {
		none = '',
		title = 'title',
		description = 'description',
		notes = 'notes',
		professions = 'professions',
		subjects = 'subjects',
		resources = 'resources'
	}

	function toArrayOfStrings(data: Object | undefined, keyword: string): string[] {
		console.log('🚀 ~ toArrayOfStrings ~ keyword:', keyword);
		console.log('🚀 ~ toArrayOfStrings ~ data:', typeof data);
		if (!data || typeof data != 'object') return [];

		//return keys where value includes keyword
		let result: string[] = [];
		for (const [key, value] of Object.entries(data)) {
			if (key.includes(keyword)) {
				result.push(value);
			}
		}
		return result;
	}

	let FieldToEdit: Fields = Fields.none;
	import { Textarea } from '$lib/components/ui/textarea';

	let subjectsArray: string[] = data.project.subjects.split('[ENTER]') ?? [''];
	const subjectsArrayBackup = subjectsArray;

	let resourcesArray: string[] = data.project.resources.split('[ENTER]') ?? [''];
	const resourcesArrayBackup = resourcesArray;

	let reRender = false;
	let loading = false;

	import { Toaster } from '$lib/components/ui/sonner';
	import { toast } from 'svelte-sonner';

	$: if (form?.successMessage) {
		toast('Handlingen lykkedes!', {
			description: form.successMessage
		});
	}

	// let subjectData = data.project?.subjects?.split('[ENTER]') || [];
	// let subjectDataBackup = subjectData;
</script>

<Toaster />
<main class="gap-4 p-2">
	<div class="relative flex flex-col justify-between gap-4">
		<div>
			<!-- ? title -->
			<div class="mb-8 flex gap-2">
				{#if Fields.title === FieldToEdit}
					<form
						use:enhance={() => {
							loading = true;
							return async ({ update }) => {
								loading = false;
								FieldToEdit = Fields.none;
								update();
							};
						}}
						class="flex w-full flex-col gap-2"
						method="POST"
						action="?/updateTitle"
					>
						<div class="grid w-full max-w-md items-center gap-1.5">
							<Label for="title">Title</Label>
							<Input
								type="text"
								placeholder="title"
								value={form?.formData?.title ?? project.title}
								name="title"
							/>
						</div>

						{#if form?.validationErrors?.title}
							<p class="text-red-500">{form?.validationErrors?.title}</p>
						{/if}
						<div class="flex gap-2">
							<Button
								size="icon"
								variant="destructive"
								on:click={() => {
									FieldToEdit = Fields.title;
								}}
								on:click={() => {
									FieldToEdit = Fields.none;
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
					</form>
				{:else}
					<h1 class="text-4xl font-semibold">{form?.formData?.title ?? project.title}</h1>
					<Button
						size="icon"
						variant="ghost"
						on:click={() => {
							FieldToEdit = Fields.title;
						}}
					>
						<Pen class="h-5 w-5" />
					</Button>
				{/if}
			</div>
			<!-- ? Description -->
			<div class="mb-8 flex w-full gap-2">
				{#if Fields.description === FieldToEdit}
					<form
						use:enhance={() => {
							loading = true;
							return async ({ update }) => {
								loading = false;
								FieldToEdit = Fields.none;
								update();
							};
						}}
						class="flex w-full flex-col gap-2"
						method="POST"
						action="?/updateDescription"
					>
						<div class="grid w-full max-w-md items-center gap-1.5">
							<Label for="description">Beskrivelse</Label>

							<Textarea
								placeholder="description"
								value={form?.formData?.description || project.description}
								name="description"
								class="w-full"
							/>
						</div>
						<div>
							<Button
								size="icon"
								variant="destructive"
								on:click={() => {
									FieldToEdit = Fields.none;
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
					</form>
				{:else}
					<p class="text max-w-[40rem] font-light leading-7">
						{form?.formData?.description || project.description} Lorem ipsum dolor sit amet consectetur
						adipisicing elit. Quos expedita earum a dolorum corrupti cupiditate commodi facilis similique
						voluptates nihil corporis laborum officiis reprehenderit id labore neque pariatur sint voluptatem
						molestias quis magni asperiores, reiciendis dolor! Laudantium, aspernatur tenetur? Deleniti
						exercitationem iste incidunt sit non, numquam itaque qui quod suscipit quasi veniam sint
						deserunt distinctio earum necessitatibus, facilis officiis assumenda dolores. Porro quo voluptatem
						corrupti vero commodi provident ipsum optio eaque natus perspiciatis et perferendis, ea iure
						ad ullam doloremque sapiente odio! Necessitatibus animi illum numquam aut, nam quisquam labore
						nihil placeat sint. Perspiciatis quibusdam, nobis obcaecati illo expedita in.
					</p>
					<Button
						size="icon"
						variant="ghost"
						on:click={() => {
							FieldToEdit = Fields.description;
						}}
					>
						<Pen class="h-5 w-5" />
					</Button>
				{/if}
			</div>
			<!-- ? Noter -->

			{#if Fields.notes === FieldToEdit}
				<form
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							loading = false;
							FieldToEdit = Fields.none;
							update();
						};
					}}
					class="flex w-full flex-col gap-2"
					method="POST"
					action="?/updateNotes"
				>
					<div class="grid w-full max-w-md items-center gap-1.5">
						<Label for="notes">Noter</Label>
						<Textarea
							placeholder="notes"
							value={form?.formData?.notes ?? project.notes ?? ''}
							name="notes"
							class="min-h-32 w-full"
						/>
					</div>
					<div>
						<Button
							size="icon"
							variant="destructive"
							on:click={() => {
								FieldToEdit = Fields.none;
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
				</form>
			{:else}
				<div class="mb-2 flex items-center gap-2">
					<h2 class=" text-xl font-bold">Underviser Notater</h2>
					<Button
						size="icon"
						variant="ghost"
						on:click={() => {
							FieldToEdit = Fields.notes;
						}}
					>
						<Pen class="h-5 w-5" />
					</Button>
				</div>
				<Alert.Root class=" w-fit ">
					<BadgeInfo class="h-4 w-4" />
					<Alert.Title>Note til vejledere.</Alert.Title>
					<Alert.Description class="max-w-[40rem]"
						>{form?.formData?.notes ||
							project.notes ||
							'Ingen notater at vise endu...'}</Alert.Description
					>
				</Alert.Root>
			{/if}

			<!-- ? Professions -->
			{#if project.professions && project.professions.length > 0}
				<div class="mb-8 mt-16">
					<h2 class="mb-1 text-xl font-bold">Uddannelser</h2>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Udd.</Table.Head>
								<Table.Head>Niveau</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each project.professions as profession}
								<Table.Row>
									<Table.Cell>{profession.profession_name}</Table.Cell>
									<Table.Cell>{profession.skill_level}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			{/if}

			<!-- ? Subjects -->
			{#if Fields.subjects === FieldToEdit}
				<form
					action="?/updateSubjects"
					method="POST"
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							loading = false;
							FieldToEdit = Fields.none;
							update();
						};
					}}
				>
					<div class="flex flex-col gap-2">
						<div class="mt-2 flex items-center gap-2">
							<Label for="subjects" class="text-lg">Fagområder</Label>
							<Button
								size="icon"
								variant="destructive"
								on:click={() => {
									FieldToEdit = Fields.none;
									subjectsArray = subjectsArrayBackup;
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
						{#key form || reRender}
							{#each subjectsArray as item, index}
								<div class="flex gap-2">
									<Input
										on:input={(e) => {
											subjectsArray[index] = e.target?.value;
										}}
										type="text"
										name="subjects-{index}"
										value={subjectsArray[index] ?? form?.formData[`subjects-${index}`] ?? ''}
										placeholder="Router 2901"
										required={index == 0}
									/>
									{#if index != 0}
										<Button
											size="icon"
											class="aspect-square"
											variant="destructive"
											on:click={() => {
												subjectsArray = subjectsArray.toSpliced(index, 1); // Remove the item at the specified index
												subjectsArray = subjectsArray;
												reRender = !reRender;
											}}
										>
											<X class=" h-4 w-4" />
										</Button>
									{/if}
								</div>
							{/each}
						{/key}

						<Button
							class=" w-fit items-center justify-start"
							type="button"
							on:click={() => {
								subjectsArray.push('');
								subjectsArray = [...subjectsArray];
							}}
						>
							<Plus class="mr-1.5 h-4 w-4" />
							Tilføj fagområde
						</Button>
					</div>
				</form>
			{:else if project.subjects}
				<Collapsible.Root class="mb-2 mt-16 w-fit min-w-52">
					<div class="flex items-center justify-between space-x-4">
						<h2 class="mb-1 text-xl font-bold">Fagområder</h2>
						{#if project.subjects.split('[ENTER]').length > 1}
							<Collapsible.Trigger asChild let:builder>
								<Button builders={[builder]} variant="ghost" size="sm" class="w-9 p-0">
									{#if builder['data-state'] === 'open'}
										<ChevronDown class="h-4 w-4 rotate-180 transform" />
									{:else}
										<ChevronUp class="h-4 w-4 rotate-180 transform" />
									{/if}
									<span class="sr-only">Toggle</span>
								</Button>
							</Collapsible.Trigger>
						{/if}
					</div>
					<div class="rounded-md border px-4 py-3 font-mono text-sm">
						{project.subjects.split('[ENTER]')[0]}
					</div>
					<Collapsible.Content class="space-y-2">
						{#key form}
							{#if form?.successMessage && toArrayOfStrings(form?.formData, 'subjects-').length > 0}
								form has been submited
								{#each toArrayOfStrings(form?.formData, 'subjects-').splice(1) as resource, index}
									<div class="mt-2 rounded-md border px-4 py-3 font-mono text-sm">
										{resource}
									</div>
								{/each}
							{:else}
								no form submited yet
								{#each project.subjects.split('[ENTER]').splice(1) as resource, index}
									<div class="mt-2 rounded-md border px-4 py-3 font-mono text-sm">
										{resource}
									</div>
								{/each}
							{/if}
						{/key}
					</Collapsible.Content>
				</Collapsible.Root>
				<Button
					size="icon"
					variant="ghost"
					on:click={() => {
						FieldToEdit = Fields.subjects;
					}}
				>
					<Pen class="h-5 w-5" />
				</Button>
			{/if}
			<!-- ? Resources -->
			{#if Fields.resources === FieldToEdit}
				<form
					action="?/updateResources"
					method="POST"
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							loading = false;
							FieldToEdit = Fields.none;
							update();
						};
					}}
				>
					<div class="flex flex-col gap-2">
						<div class="mt-2 flex items-center gap-2">
							<Label for="resources" class="text-lg">Ressourcer</Label>
							<Button
								size="icon"
								variant="destructive"
								on:click={() => {
									FieldToEdit = Fields.none;
									resourcesArray = resourcesArrayBackup;
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
						{#key form || reRender}
							{#each resourcesArray as item, index}
								<div class="flex gap-2">
									<Input
										on:input={(e) => {
											resourcesArray[index] = e.target?.value;
										}}
										type="text"
										name="resources-{index}"
										value={resourcesArray[index] ?? form?.formData[`resources-${index}`] ?? ''}
										placeholder="Router 2901"
										required={index == 0}
									/>
									{#if index != 0}
										<Button
											size="icon"
											class="aspect-square"
											variant="destructive"
											on:click={() => {
												resourcesArray = resourcesArray.toSpliced(index, 1); // Remove the item at the specified index
												resourcesArray = resourcesArray;
												reRender = !reRender;
											}}
										>
											<X class=" h-4 w-4" />
										</Button>
									{/if}
								</div>
							{/each}
						{/key}

						<Button
							class=" w-fit items-center justify-start"
							type="button"
							on:click={() => {
								resourcesArray.push('');
								resourcesArray = [...resourcesArray];
							}}
						>
							<Plus class="mr-1.5 h-4 w-4" />
							Tilføj ressourcer
						</Button>
					</div>
				</form>
			{:else if project.resources}
				<Collapsible.Root class="mb-2 mt-16 w-fit min-w-52">
					<div class="flex items-center justify-between space-x-4">
						<h2 class="mb-1 text-xl font-bold">Ressourcer</h2>
						{#if project.resources.split('[ENTER]').length > 1}
							<Collapsible.Trigger asChild let:builder>
								<Button builders={[builder]} variant="ghost" size="sm" class="w-9 p-0">
									{#if builder['data-state'] === 'open'}
										<ChevronDown class="h-4 w-4 rotate-180 transform" />
									{:else}
										<ChevronUp class="h-4 w-4 rotate-180 transform" />
									{/if}
									<span class="sr-only">Toggle</span>
								</Button>
							</Collapsible.Trigger>
						{/if}
					</div>
					<div class="rounded-md border px-4 py-3 font-mono text-sm">
						{project.resources.split('[ENTER]')[0]}
					</div>
					<Collapsible.Content class="space-y-2">
						{#each project.resources.split('[ENTER]').splice(1) as resource}
							<div class="mt-2 rounded-md border px-4 py-3 font-mono text-sm">{resource}</div>
						{/each}
					</Collapsible.Content>
				</Collapsible.Root>
				<Button
					size="icon"
					variant="ghost"
					on:click={() => {
						FieldToEdit = Fields.resources;
					}}
				>
					<Pen class="h-5 w-5" />
				</Button>
			{/if}
		</div>

		<!-- ? infobox -->
		<Card.Root class="sticky top-24 h-fit min-w-72 border-primary">
			<Card.Header class="pb-4">
				{#if project?.authors?.some((author) => author.user_id === data.user?.id)}
					<Button class="mb-2" size="lg">Rediger projekt</Button>
				{/if}
				<Card.Title>Info</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-col gap-4">
					<div class="flex flex-col gap-1">
						<span class="text-sm text-muted-foreground">Oprettet</span>
						<span class="text-sm"
							>{created_at.getDay()}.
							{months[created_at.getMonth()]}
							{created_at.getFullYear()}</span
						>
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-sm text-muted-foreground">Senest opdateret</span>
						<span class="text-sm"
							>{updated_at.getDay()}.
							{months[updated_at.getMonth()]}
							{updated_at.getFullYear()}</span
						>
					</div>
				</div>
			</Card.Content>
			<Card.Header class="pb-4">
				<Card.Title class="flex items-center gap-2">Forfattere</Card.Title>
			</Card.Header>
			<Card.Content>
				<span class="text-sm text-muted-foreground">Dette project er lavet af</span>
				<div
					id="authors"
					class="p.2 mt-2 flex w-full flex-col flex-wrap gap-x-2 gap-y-2 rounded-md border-secondary"
				>
					{#if project.authors && project.authors.length > 0}
						{#each project.authors as author}
							{#if author?.user}
								<a href="/?forfatter={author.user.firstname}-{author.user.lastname}">
									<div class="flex min-w-max items-center gap-2">
										<div
											class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/75 text-primary-foreground"
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
				</div>
			</Card.Content>

			<Card.Header class="pb-4">
				<Card.Title>Projekt links</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if project.files}
					{#each project.files as file}
						<DowdloadLink pathName={`${project.id}/${file.name}`}>{file.name}</DowdloadLink>
					{/each}
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>
{#if loading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<Loader2 class="h-20 w-20 animate-spin text-primary" />
	</div>
{/if}
