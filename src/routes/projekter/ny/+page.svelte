<script lang="ts">
	import type { ActionData, PageData } from './$types';

	export let form: ActionData;
	export let data: PageData;

	$: if (form?.projectId) {
		goto(`/projekter/${form.projectId}`);
	}

	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Plus, X, Check, ChevronsUpDown, User } from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';

	import { cn } from '$lib/utils';
	import { tick } from 'svelte';

	let itSupoter = false;
	let programmering = false;
	let infrastruktur = false;

	let subjectsArray: string[] = [''];
	let resourcesArray: string[] = [''];

	let reRender = false;

	let numberOfFiles = [0];

	let users = data.users;

	let usersAdded: User[] = [];

	let open = false;
	let value = '';

	function getFullName(user: User): string | null {
		if (!user) return null;
		return user.firstname + ' ' + user.lastname;
	}
	$: selectedValue =
		getFullName(users.find((f: User) => f.id.toString() === value)) ?? 'Vælg en bruger..';

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	import { Loader2 } from 'lucide-svelte';
	let loading = false;
</script>

<main class="mb-16 flex flex-col gap-8 p-2 sm:p-8">
	<div class="mx-auto">
		<h1 class="text-4xl font-semibold">Opret et nyt projekt.</h1>
		<p class="text mt-2">Udfyld alle felterne, og tryk på offentliggør for at lægge det op.</p>

		{#key form}
			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						update();
					};
				}}
				class="mt-8 flex w-full max-w-lg flex-col gap-12"
				enctype="multipart/form-data"
			>
				<!-- ? title -->
				<div class="flex w-full flex-col gap-1.5">
					<Label for="title" class="text-lg">Titel</Label>
					<Input
						name="title"
						value={form?.formData?.title}
						type="text"
						id="title"
						required={true}
						placeholder="Snake spil i Python"
					/>
					<p class="text-sm text-muted-foreground">Titlen på projektets.</p>
					{#if form?.validationErrors?.title}
						<p class="text-red-500">{form?.validationErrors?.title}</p>
					{/if}
				</div>
				<!-- ? description -->
				<div class="flex w-full flex-col gap-1.5">
					<Label class="text-lg" for="description">Beskrivelse</Label>
					<Textarea
						name="description"
						value={form?.formData?.description}
						id="description"
						required={true}
						placeholder="Dette projekt handler om..."
					/>
					<p class="text-sm text-muted-foreground">
						En kort forklaring af projektet. Hvad handler det om?
					</p>
					{#if form?.validationErrors?.description}
						<p class="text-red-500">{form?.validationErrors?.description}</p>
					{/if}
				</div>
				<!-- ? course length -->
				<div class="flex w-full flex-col gap-1.5">
					<Label class="text-lg" for="description">Tidforbrug</Label>
					<Input
						name="course_length"
						value={form?.formData?.course_length}
						id="course_length"
						required={true}
						placeholder="f.eks. 2 Uger"
					/>
					<p class="text-sm text-muted-foreground">Hvor lang tid tager det at lave projektet?</p>
					{#if form?.validationErrors?.course_length}
						<p class="text-red-500">{form?.validationErrors?.course_length}</p>
					{/if}
				</div>
				<!-- ? notes -->
				<div class="flex w-full flex-col gap-1.5">
					<Label for="notes" class="text-lg">Underviser notater</Label>
					<Input
						name="notes"
						value={form?.formData?.notes}
						type="text"
						id="notes"
						placeholder="Godt til nye elever..."
					/>
					<p class="text-sm text-muted-foreground">Notater som kun vejledere og lærere kan se.</p>
					{#if form?.validationErrors?.notes}
						<p class="text-red-500">{form?.validationErrors?.notes}</p>
					{/if}
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
								<input
									on:input={(e) => {
										itSupoter = e.target?.checked ? true : false;
									}}
									type="checkbox"
									name="it_supporter"
									checked={form?.formData?.it_supporter}
									id="it_supporter"
									aria-labelledby="it_supporter_label"
								/>
								<Label
									id="it_supporter_label"
									for="it_supporter"
									class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									It-supporter
								</Label>
								{#if form?.validationErrors?.it_supporter}
									<p class="text-red-500">{form?.validationErrors?.it_supporter}</p>
								{/if}
							</div>

							<div class="mt-2 flex w-full max-w-56 flex-col gap-1.5 sm:mt-0">
								<Label for="it-supporter_niveau">Niveau</Label>
								<Input
									disabled={!itSupoter}
									required={itSupoter}
									name="it_supporter_skill_level"
									value={form?.formData?.it_supporter_skill_level}
									type="text"
									id="it_supporter_niveau"
									placeholder="H2 eller GF1"
								/>
								{#if form?.validationErrors?.it_supporter_skill_level}
									<p class="text-red-500">{form?.validationErrors?.it_supporter_skill_level}</p>
								{/if}
							</div>
						</div>
						<div
							id="profession-section"
							class="flex flex-col items-start justify-between space-x-2 sm:flex-row sm:items-center"
						>
							<div>
								<input
									on:input={(e) => {
										programmering = e.target?.checked || false;
									}}
									type="checkbox"
									name="programmering"
									checked={form?.formData?.programmering}
									id="programmering"
									aria-labelledby="programmering_label"
								/>
								{#if form?.validationErrors?.programmering}
									<p class="text-red-500">{form?.validationErrors?.programmering}</p>
								{/if}
								<Label
									id="programmering_label"
									for="programmering"
									class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Datatekniker med speciale i programmering
								</Label>
							</div>
							<div class="mt-2 flex w-full max-w-56 flex-col gap-1.5 sm:mt-0">
								<Label for="programmering_niveau">Niveau</Label>
								<Input
									disabled={!programmering}
									required={programmering}
									value={form?.formData?.programmering_skill_level}
									type="text"
									id="programmering_niveau"
									placeholder="H2 eller GF1"
									name="programmering_skill_level"
								/>
								{#if form?.validationErrors?.programmering_skill_level}
									<p class="text-red-500">{form?.validationErrors?.programmering_skill_level}</p>
								{/if}
							</div>
						</div>
						<div
							id="profession-section"
							class="flex flex-col items-start justify-between space-x-2 sm:flex-row sm:items-center"
						>
							<div>
								<input
									on:input={(e) => {
										infrastruktur = e.target?.checked || false;
									}}
									type="checkbox"
									checked={form?.formData?.infrastruktur}
									name="infrastruktur"
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
								{#if form?.validationErrors?.infrastruktur}
									<p class="text-red-500">{form?.validationErrors?.infrastruktur}</p>
								{/if}
							</div>
							<div class="mt-2 flex w-full max-w-56 flex-col gap-1.5 sm:mt-0">
								<Label for="infrastruktur_niveau">Niveau</Label>
								<Input
									disabled={!infrastruktur}
									required={infrastruktur}
									value={form?.formData?.infrastruktur_skill_level}
									type="text"
									id="infrastruktur_niveau"
									placeholder="H2 eller GF1"
									name="infrastruktur_skill_level"
								/>
								{#if form?.validationErrors?.infrastruktur_skill_level}
									<p class="text-red-500">{form?.validationErrors?.infrastruktur_skill_level}</p>
								{/if}
							</div>
						</div>
					</div>
				</div>
				<!-- ? subjects -->
				<div class="flex flex-col gap-2">
					<Label for="subjects" class="text-lg">Fag</Label>
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
									placeholder="Cisco"
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

							{#if form?.validationErrors?.[`subjects-${index}`]}
								<p class="text-red-500">{form?.validationErrors?.[`subjects-${index}`]}</p>
							{/if}
						{/each}
					{/key}
					<Button
						class="mt-2 w-fit items-center justify-start"
						type="button"
						on:click={() => {
							subjectsArray.push('');
							subjectsArray = [...subjectsArray];
						}}
					>
						<Plus class="mr-1.5 h-4 w-4" />
						Tilføj
					</Button>
				</div>
				<!-- ? resources -->
				<div class="flex flex-col gap-2">
					<Label for="resources" class="text-lg">Ressourcer</Label>
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

							{#if form?.validationErrors?.[`resources-${index}`]}
								<p class="text-red-500">{form?.validationErrors?.[`resources-${index}`]}</p>
							{/if}
						{/each}
					{/key}
					<Button
						class="mt-2 w-fit items-center justify-start"
						type="button"
						on:click={() => {
							resourcesArray.push('');
							resourcesArray = [...resourcesArray];
						}}
					>
						<Plus class="mr-1.5 h-4 w-4" />
						Tilføj
					</Button>
				</div>
				<!-- ? files -->
				<div class="flex flex-col gap-2">
					<Label for="file" class="text-lg">Projektfiler</Label>

					{#each numberOfFiles as index}
						<div class="flex gap-2" id="files-{index}">
							<Input type="file" name={`files-${index}`} required={index == 0} />
							
								<Button
									size="icon"
									class="aspect-square"
									variant="destructive"
									on:click={() => {
										const target = document.querySelector(`#files-${index}`);
										target?.remove();
									}}
								>
									<X class="h-4 w-4" />
								</Button>
							
						</div>
						<p class="text-sm text-muted-foreground">
							Upload filer som er relateret til projektet. F.eks. kodefiler, billeder og dokumenter.
							<br />Tip: Giv filerne et beskrivende navn før upload.
						</p>
						{#if form?.validationErrors?.[`files-${index}`]}
							<p class="text-red-500">{form?.validationErrors?.[`files-${index}`]}</p>
						{/if}
					{/each}

					<Button
						class="mt-2 w-fit items-center justify-start"
						type="button"
						on:click={() => {
							numberOfFiles.push(numberOfFiles.length);
							numberOfFiles = [...numberOfFiles];
						}}
					>
						<Plus class="mr-1.5 h-4 w-4" />
						Tilføj
					</Button>
				</div>

				<!-- live mode -->
				<div class="flex w-full flex-col gap-1.5">
					<Label for="livemode" class="text-lg">Udgivelsestidpunkt</Label>
					<div>
						<input checked={true} type="radio" name="live" value="yes" />
						<Label for="livemode">Udgiv nu</Label>
					</div>
					<div>
						<input type="radio" name="live" value="no" />
						<Label for="livemode">Gem klade og udgiv senere</Label>
					</div>
				</div>

				<!-- ? users -->
				<div class="flex flex-col gap-1.5">
					<Label for="users" class="text-lg">Medforfattere</Label>
					<Popover.Root bind:open let:ids>
						<Popover.Trigger asChild let:builder>
							<Button
								builders={[builder]}
								variant="outline"
								role="combobox"
								aria-expanded={open}
								class="w-[200px] justify-between"
							>
								{selectedValue}
								<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</Popover.Trigger>
						<Popover.Content class="w-[200px] p-0">
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
												class={cn(
													'mr-2 h-4 w-4',
													value !== user.id.toString() && 'text-transparent'
												)}
											/>
											{user.firstname}
											{user.lastname}
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.Root>
						</Popover.Content>
					</Popover.Root>
					<p class="text-sm text-muted-foreground">
						Hvem har været med til at lave projektet ud over dig selv?
					</p>
					{#each usersAdded as user, index}
						<Button
							id="users-{index}"
							variant="outline"
							class="w-fit gap-4"
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
				</div>

				<Button type="submit">Udgiv projekt</Button>
			</form>
		{/key}
	</div>
</main>
{#if loading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<Loader2 class="h-20 w-20 animate-spin text-primary" />
	</div>
{/if}

<style>
</style>
