<script lang="ts">
	import '../app.pcss';

	import type { LayoutData } from './$types';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { HamburgerMenu, Person, MagnifyingGlass, Home } from 'radix-icons-svelte';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { onMount } from 'svelte';
	import { user } from '$lib/index';

	import { beforeNavigate, afterNavigate } from '$app/navigation';

	import { gsap } from 'gsap/dist/gsap';
	import Flip from 'gsap/dist/Flip';

	let state: any;

	gsap.registerPlugin(Flip);

	beforeNavigate(() => {
		state = Flip.getState('#theme-image, #login-form');
	});

	afterNavigate(() => {
		if (state) {
			Flip.from(state, {
				duration: 0.5,
				ease: 'easeInOut',
				scale: false,
				targets: '#theme-image, #login-form',
				simple: true
			});
		}
	});

	export let data: LayoutData;
	let darkMode = data.darkmode;
	let color: string = data.color ?? '';
	user.set(data.user);

	let loaded = false;
	onMount(() => {
		loaded = true;
		setTheme();
	});
	function setTheme() {
		if (darkMode) {
			document.documentElement.id = 'dark';
		} else {
			document.documentElement.id = 'light';
		}
		if (color && loaded) {
			document.documentElement.setAttribute('theme', color);
			color = color;
		}
	}
</script>

<nav class="sticky top-0 flex justify-between bg-background px-4 py-2">
	<div class="flex gap-4">
		<Sheet.Root>
			<Sheet.Trigger asChild let:builder>
				<Button aria-label="Åben Sidebar knap" size="icon" builders={[builder]} variant="outline">
					<HamburgerMenu class="h-[1.2rem] w-[1.2rem]" />
				</Button>
			</Sheet.Trigger>
			<Sheet.Content side="left">
				<Sheet.Header>
					<Sheet.Title>Find det du leder efter...</Sheet.Title>
					<Sheet.Description class="flex flex-col gap-2">
						<Button variant="outline">Forside</Button>

						<Button variant="outline" href="/konto">Din konto</Button>
						{#if data.user?.authority_level >= 2 || ($user?.authority_level && $user?.authority_level >= 2)}
							<Button variant="outline" href="/admin/projekter">Administrer projekter</Button>
						{/if}
						{#if data.user?.authority_level >= 3 || ($user?.authority_level && $user?.authority_level >= 3)}
							<Button variant="outline" href="/admin/brugere">Administrer brugere</Button>
						{/if}
						<!-- <div class="relative mt-2">
							<MagnifyingGlass
								class="color-foreground absolute left-2 top-1/2 h-[1.2rem] w-[1.2rem] -translate-y-1/2 fill-foreground"
							/>
							<Input
								id="search"
								type="search"
								name="projekt"
								placeholder="Python"
								class="mb-1 w-full pl-8 text-foreground"
								tabindex={2}
							/>
						</div>
						<p>Søg efter ord fra alle projekter.</p> -->
						<!-- <ul class="flex flex-col gap-2">
							<li>
								<Button
									class="w-full justify-start text-start text-foreground"
									variant="outline"
									href="/">Hjem</Button
								>
							</li>
							<li>
								<Button
									class="w-full justify-start text-start text-foreground"
									variant="outline"
									href="/user">Din side</Button
								>
							</li>
							<li>
								<Button
									class="w-full justify-start text-start text-foreground"
									variant="outline"
									href="/admin">Admin</Button
								>
							</li>
						</ul> -->
					</Sheet.Description>
				</Sheet.Header>
			</Sheet.Content>
		</Sheet.Root>
		<div class="flex gap-2">
			<Tooltip.Root>
				<Tooltip.Trigger tabindex={-1}>
					<Button aria-label="Link til hjem siden" variant="secondary" size="icon" href="/">
						<Home class="h-[1.2rem] w-[1.2rem]" />
					</Button>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>Hjem</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
	</div>

	<div class="flex gap-2">
		<ThemeToggle {darkMode} {loaded} {color} />
		{#if $user}
			<Button
				aria-label="Skift farve tema"
				variant="secondary"
				class="justify-center2 flex items-center gap-2 px-4 pl-2"
				on:click={async () => {
					await fetch('/api/login', { method: 'DELETE' });
					user.set(null);
					location.reload();
				}}
			>
				<Person class="h-[1.2rem] w-[1.2rem]" />
				Log ud
			</Button>
		{:else}
			<Button
				variant="secondary"
				class="justify-center2 flex items-center gap-2 px-4 pl-2"
				href="/login"
			>
				<Person class="h-[1.2rem] w-[1.2rem]" />
				Login
			</Button>
		{/if}
	</div>
</nav>
<slot />
