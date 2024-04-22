<script lang="ts">
	export let user: User;
	export let project: Project;

	import { Pen, Trash, Undo2, Send, CornerDownRight } from 'lucide-svelte';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as ContextMenu from '$lib/components/ui/context-menu/index.js';
	import { formatCommentTimePosted, messageShortener, months } from '$lib/index';
	import { Button } from '$lib/components/ui/button';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { toast } from 'svelte-sonner';
	import type { Project, User } from '$lib/types';

	let message = '';
	let answer = '';

	async function uploadComment(root_comment_id: null | number, answer_comment_id: null | number) {
		if (!user) {
			toast('Ikke logget ind.', {
				description: 'Du skal være logget ind for at kunne kommentere på et projekt'
			});
			return;
		}

		const textMessage = answer_comment_id ? answer : message;
		console.log({
			message: textMessage,
			project_id: project.id,
			root_comment_id,
			answer_comment_id
		});
		const response = await fetch(`/api/comments`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				message: textMessage,
				project_id: project.id,
				root_comment_id,
				answer_comment_id
			})
		});

		if (response.ok) {
			message = '';
			answer = '';
			location.reload();
		} else {
			toast('Fejl', {
				description: 'Der skete en fejl.'
			});
		}
	}
	async function updateComment(id: number, message: string) {
		if (!user) {
			toast('Ikke logget ind.', {
				description: 'Du skal være logget ind for at kunne kommentere på et projekt'
			});
			return;
		}

		const response = await fetch(`/api/comments/${id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ message })
		});

		if (response.ok) {
			toast('Kommentar opdateret', {
				description: 'Din kommentar er blevet opdateret'
			});
			message = '';
			answer = '';
			location.reload();
		} else {
			toast('Fejl', {
				description: 'Der skete en fejl.'
			});
		}
	}
	async function deleteComment(id: number) {
		if (!user) {
			toast('Ikke logget ind.', {
				description: 'Du skal være logget ind for at kunne kommentere på et projekt'
			});
			return;
		}

		const response = await fetch(`/api/comments/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (response.ok) {
			toast('Kommentar slettet', {
				description: 'Din kommentar er blevet fjernet'
			});
			message = '';
			location.reload();
		} else {
			toast('Fejl', {
				description: 'Der skete en fejl.'
			});
		}
	}

	let commentToEdit: number | null = null;
	let commentAnswer: number | null = null;
</script>

<section class="mb-16">
	<h2 class="mt-16 text-2xl font-bold">Kommentarer</h2>
	<h3 class="text-sm text-foreground/75">Kun synlig for undervisere.</h3>

	<form
		class="mt-4"
		on:submit={() => {
			uploadComment(null, null);
		}}
	>
		<Textarea
			on:keydown={(e) => {
				if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
					uploadComment(null, null);
				}
			}}
			class="w-full rounded-md border p-2"
			placeholder="Skriv en kommentar"
			bind:value={message}
		></Textarea>
		<div class="mt-2 flex justify-end">
			<Button disabled={!message} type="submit">Kommenter</Button>
		</div>
	</form>
	{#if project.projectComments}
		<div class="flex flex-col gap-6">
			{#each project.projectComments as comment}
				<ContextMenu.Root>
					<ContextMenu.Trigger
						><article class="flex min-w-max flex-col items-start gap-2">
							{#if comment.answer_comment_id}
								<div>
									<p class="text-sm text-foreground/50">
										{messageShortener(
											project.projectComments.find((c) => c.id === comment.answer_comment_id)
												?.message || '',
											30
										)}
									</p>
								</div>
							{/if}
							<div
								class={`flex ${comment.answer_comment_id ? 'items-start' : 'items-center'}  gap-4`}
							>
								<!-- ? avatar -->
								{#if comment.answer_comment_id}
									<div>
										<CornerDownRight class="text-foreground/50" />
									</div>
								{/if}
								<div
									class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/75 text-primary-foreground"
								>
									{comment.firstname ? comment.firstname[0] : ''}{comment.lastname
										? comment.lastname[0]
										: ''}
								</div>
								<!-- ? message header -->
								<div class="flex flex-col items-start gap-1">
									<div class="flex items-center gap-2">
										<!-- ? name -->
										<span class=" font-bold"
											>{comment.user_id === user?.id
												? 'you'
												: comment.firstname + ' ' + comment.lastname}
										</span>
										<!-- ? bagdes -->
										{#if project?.authors?.some((author) => author.user_id === user?.id)}
											<Badge variant="outline">Ejer</Badge>
										{:else if comment.authority_level && comment.authority_level > 1}
											<Badge variant="outline">Administrator</Badge>
										{/if}
										·
										<!-- ? time -->
										<p class="text-xs font-medium text-foreground/75">
											{formatCommentTimePosted(comment.created_at)}
										</p>
										<!-- ? edited -->
										{#if new Date(comment.updated_at).getTime() != new Date(comment.created_at).getTime()}
											·
											<p class="text-xs font-medium text-foreground/75">Redigeret</p>
										{/if}
									</div>
									<!-- ? message -->
									{#if commentToEdit === comment.id}
										<!-- ? edit message -->
										<form
											class="flex gap-2"
											on:submit={(e) => {
												try {
													updateComment(comment.id, e.target['message'].value);
												} catch (error) {
													console.error(error);
												}
											}}
										>
											<Input
												name="message"
												class="w-full rounded-md border p-2"
												placeholder="Skriv en kommentar"
												value={comment.message}
											></Input>
											<div class="flex gap-1">
												<Button
													variant="ghost"
													size="icon"
													type="reset"
													on:click={() => {
														commentToEdit = null;
													}}
												>
													<Undo2 class="h-5 w-5" />
												</Button>
												<Button
													size="icon"
													type="submit"
													on:click={(e) => {
														updateComment(comment.id, e.target['message'].value);
													}}
												>
													<Send class="h-5 w-5" />
												</Button>
											</div>
										</form>
									{:else}
										<p class="text-sm text-foreground/80">{comment.message}</p>
									{/if}

									<!-- ? display comment answer form -->
									{#if commentAnswer === comment.id}
										<form
											class="flex items-center gap-2"
											on:submit={() => {
												const root_comment_id = comment.root_comment_id ?? comment.id;
												console.log('root_comment_id', root_comment_id);
												uploadComment(root_comment_id, comment.id);
											}}
										>
											<CornerDownRight class="text- h-8 w-8 text-foreground/50" />
											<Input
												bind:value={answer}
												name="message"
												class="w-full rounded-md border p-2"
												placeholder="Skriv er svar"
											></Input>
											<div class="flex gap-1">
												<Button
													variant="ghost"
													size="icon"
													type="reset"
													on:click={() => {
														commentAnswer = null;
													}}
												>
													<Undo2 class="h-5 w-5" />
												</Button>
												<Button size="icon" type="submit">
													<Send class="h-5 w-5" />
												</Button>
											</div>
										</form>
									{:else}
										<Button
											on:click={() => {
												commentToEdit = null;
												commentAnswer = comment.id;
											}}
											variant="link"
											class="mt-2 h-4  p-0 text-xs text-foreground/75">Svar</Button
										>
									{/if}
								</div>
							</div>
						</article></ContextMenu.Trigger
					>
					<ContextMenu.Content>
						<ContextMenu.Item
							on:click={() => {
								commentToEdit = comment.id;
								commentAnswer = null;
							}}><Pen class="mr-2 h-4 w-4" /> Rediger</ContextMenu.Item
						>
						<ContextMenu.Item
							on:click={() => {
								deleteComment(comment.id);
							}}
						>
							<Trash class="mr-2 h-4 w-4" /> Slet
						</ContextMenu.Item>
					</ContextMenu.Content>
				</ContextMenu.Root>
			{/each}
		</div>
	{/if}
</section>
