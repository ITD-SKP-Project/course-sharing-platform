<script lang="ts">
	import { Sun, Moon, BlendingMode } from 'radix-icons-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Tooltip from '$lib/components/ui/tooltip';

	export let darkMode: boolean;
	export let loaded: boolean;
	export let color: string = '';

	$: changeColor(color);
	function changeColor(color_: string | undefined) {
		if (!loaded || !color_) return;
		document.documentElement.setAttribute('theme', color_);
		document.cookie = `color=${JSON.stringify(color)}; path=/; samesite=strict; secure=true`;
	}

	function toggleDatkMode() {
		if (!loaded) return;
		if (darkMode) {
			document.documentElement.id = 'light';
			darkMode = false;
		} else {
			document.documentElement.id = 'dark';
			darkMode = true;
		}
		document.cookie = `darkmode=${JSON.stringify(darkMode)}; path=/; samesite=strict; secure=true`;
	}
</script>

<div class="flex gap-2">
	<Tooltip.Root>
		<Tooltip.Trigger tabindex={-1}>
			<Button
				aria-label="Tooltip fra skift mellem light and darkmode"
				variant="outline"
				size="icon"
				on:click={toggleDatkMode}
			>
				{#if darkMode}
					<Moon class="h-[1.2rem] w-[1.2rem]" />
				{:else}
					<Sun class="h-[1.2rem] w-[1.2rem]" />
				{/if}
			</Button>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>Skift mellem lys og mørk tilstand</p>
		</Tooltip.Content>
	</Tooltip.Root>

	<Tooltip.Root>
		<Tooltip.Trigger tabindex={-1}>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button
						aria-label="Skift mellem light and darkmode"
						size="icon"
						variant="outline"
						builders={[builder]}
					>
						<BlendingMode class="h-[1.2rem] w-[1.2rem]" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56">
					<DropdownMenu.Label>Tema farve</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.RadioGroup bind:value={color} class="flex flex-col gap-1 ">
						<DropdownMenu.RadioItem class="flex gap-2" value="blue">
							<div class="blue aspect-square h-5 w-5 rounded-full" />
							Blue</DropdownMenu.RadioItem
						>
						<DropdownMenu.RadioItem class="flex gap-2" value="purple">
							<div class="purple aspect-square h-5 w-5 rounded-full" />
							Purple</DropdownMenu.RadioItem
						>
						<DropdownMenu.RadioItem class="flex gap-2" value="green">
							<div class="green aspect-square h-5 w-5 rounded-full" />
							Green</DropdownMenu.RadioItem
						>
						<DropdownMenu.RadioItem class="flex gap-2" value="yellow">
							<div class="yellow aspect-square h-5 w-5 rounded-full" />
							Yellow</DropdownMenu.RadioItem
						>
						<DropdownMenu.RadioItem class="flex gap-2" value="orange">
							<div class="orange aspect-square h-5 w-5 rounded-full" />
							Orange</DropdownMenu.RadioItem
						>
						<DropdownMenu.RadioItem class="flex gap-2" value="red">
							<div class="red aspect-square h-5 w-5 rounded-full" />
							Red</DropdownMenu.RadioItem
						>
					</DropdownMenu.RadioGroup>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>Skift farvetema</p>
		</Tooltip.Content>
	</Tooltip.Root>
</div>

<style>
</style>
