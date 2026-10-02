'use client';

import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Anchor, Text, View, XStack, YStack, type GuiElement } from '@hanzo/ui';
import { HanzoCommandPalette, HanzoWordmark, MARKS, type GlyphName, type HanzoCommandEntry } from '@hanzogui/shell';
import { COMPANY, LOGIN, MENUS, TRY, at, away, type Link, type Menu } from '@hanzo/ui/masthead';
import { templates } from '../templates-data';
import { getUniqueTemplates } from '../lib/template-utils';

/**
 * hanzo.ai's header, worn by the gallery: the same tree (`@hanzo/ui/masthead`),
 * the same bar, menus, search and phone sheet, drawn with the shell's marks and
 * wordmark. The name in the corner is the gallery's and goes to the gallery's
 * home; every row in the menus is a page on hanzo.ai and goes there.
 *
 * Geometry is hanzo.ai's: a 60px row on the page gutter, 34px pills, 13px
 * labels, a 16px mark before each menu from `$xl`, a 12px chevron after. Below
 * `$lg` the bar is the name, search and a menu button.
 *
 * Three grounds: clear over the top of the page, glass once the page moves
 * under it, and the panel's opaque ground while a menu or the sheet hangs from
 * it, so bar and panel read as one surface.
 */

/** The host the tree's paths are pages on. */
const ORIGIN = 'https://hanzo.ai';

/** The bar's height, which sticky rows under it stand below. */
export const HEADER = 60;

const GRACE = 160;
const REST = 70;

const WASH = '$ink/6';
const RING = 'inset 0 0 0 1px rgb(255 255 255 / .10)';
const LIT = { color: 'var(--foreground)', bg: WASH, boxShadow: RING } as const;
const UNDER = `calc(${HEADER}px + env(safe-area-inset-top))`;
const PANEL = 'var(--chrome-panel)';
const DROP = '0 24px 60px -16px rgb(0 0 0 / .75)';
const GLASS = '$background/72';
const BLUR = 'blur(20px) saturate(1.8)';

const BAR = {
  position: 'sticky',
  t: 0,
  z: 50,
  items: 'center',
  gap: 12,
  boxSizing: 'content-box',
  height: HEADER,
  pt: 'calc(0px + env(safe-area-inset-top))',
  px: 'var(--page-gutter)',
} as const;

const BRAND = { items: 'center', shrink: 0, height: 34, ml: -4, rounded: 999, hoverStyle: { bg: WASH, boxShadow: RING } } as const;
const NAME = { display: 'flex', items: 'center', height: '100%', pl: 12, pr: 12, color: 'var(--foreground)', whiteSpace: 'nowrap', textDecorationLine: 'none' } as const;

const PILL = {
  display: 'flex',
  items: 'center',
  shrink: 0,
  height: 34,
  p: 0,
  borderWidth: 0,
  rounded: 999,
  bg: 'transparent',
  color: 'var(--muted-foreground)',
  cursor: 'pointer',
  hoverStyle: LIT,
} as const;

const TRIGGER = { ...PILL, gap: 6, px: 12, fontSize: '$2', lineHeight: 20, fontWeight: '500', whiteSpace: 'nowrap' } as const;

/** The one filled control, in the bar and in the sheet. */
const ACT = {
  display: 'flex',
  items: 'center',
  justify: 'center',
  gap: 2,
  height: 34,
  px: 14,
  rounded: 999,
  bg: 'var(--foreground)',
  color: 'var(--background)',
  fontSize: '$2',
  lineHeight: 20,
  fontWeight: '600',
  whiteSpace: 'nowrap',
  hoverStyle: { opacity: 0.88 },
} as const;

const ARRIVE = { enterStyle: { opacity: 0, y: -4 }, transition: 'quickest' } as const;

const ROW = {
  display: 'flex',
  items: 'center',
  self: 'flex-start',
  mx: -8,
  px: 8,
  rounded: 8,
  whiteSpace: 'nowrap',
  hoverStyle: { color: 'var(--foreground)' },
  focusVisibleStyle: { color: 'var(--foreground)' },
} as const;
const LEAD = { ...ROW, py: 2, fontSize: '$8', lineHeight: 33.28, fontWeight: '400', letterSpacing: -0.26, color: 'var(--foreground)' } as const;
const PLAIN = { ...ROW, py: 5, fontSize: '$2', lineHeight: 20, fontWeight: '500', color: 'var(--muted-foreground)' } as const;

const LINE = {
  display: 'flex',
  items: 'center',
  justify: 'flex-start',
  minH: 44,
  rounded: 8,
  fontWeight: '400',
  color: 'var(--muted-foreground)',
  hoverStyle: { color: 'var(--foreground)' },
  focusVisibleStyle: { color: 'var(--foreground)' },
} as const;
const DOOR = { display: 'flex', items: 'center', justify: 'flex-start', minH: 44, fontSize: '$4', lineHeight: 20, fontWeight: '400', color: 'var(--foreground)' } as const;

/** Every template, for ⌘K, and every row of the tree. */
const COMMANDS: HanzoCommandEntry[] = [
  ...getUniqueTemplates(templates).map((x) => ({
    id: `template/${x.slug}`,
    title: x.displayName,
    hint: x.framework,
    href: `/templates/${x.slug}`,
    group: 'Templates',
    keywords: `${x.category} ${x.useCase}`,
  })),
  ...[COMPANY, ...MENUS].flatMap((menu) =>
    menu.groups.flatMap((group) =>
      group.links.map((link) => ({
        id: `nav/${menu.id}/${group.title}/${link.label}`,
        title: link.label,
        href: at(link.href, ORIGIN),
        group: menu.label,
        external: away(link.href),
      })),
    ),
  ),
];

function Mark({ name, bar = false }: { name: GlyphName; bar?: boolean }) {
  const Glyph = MARKS[name];
  return (
    <View render="span" aria-hidden display={bar ? 'none' : 'flex'} $xl={bar ? { display: 'flex' } : undefined} opacity={0.9}>
      <Glyph size={16} />
    </View>
  );
}

function Chevron({ turned, end = false }: { turned: boolean; end?: boolean }) {
  return (
    <View render="span" aria-hidden display="flex" shrink={0} ml={end ? 'auto' : 0} rotate={turned ? '180deg' : '0deg'} transition="quickest">
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </View>
  );
}

function Out() {
  return (
    <View render="span" aria-hidden display="flex" ml="calc(0.28em)" opacity={0.7}>
      <svg width="0.75em" height="0.75em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>
    </View>
  );
}

/** A row: the label, and ↗ with a new tab when the tree says it leaves hanzo.ai. */
function Row({ link, onClick, ...style }: { link: Link; onClick?: () => void; [k: string]: unknown }) {
  const out = away(link.href);
  return (
    <Anchor
      href={at(link.href, ORIGIN)}
      target={out ? '_blank' : undefined}
      rel={out ? 'noreferrer' : undefined}
      onClick={onClick}
      textDecorationLine="none"
      {...style}
    >
      {link.label}
      {out ? <Out /> : null}
    </Anchor>
  );
}

function Title({ sheet = false, children }: { sheet?: boolean; children: ReactNode }) {
  return (
    <Text
      render="p"
      mt={sheet ? 4 : 0}
      mb={sheet ? 2 : 10}
      mx={0}
      fontSize={sheet ? '$1' : '$2'}
      lineHeight={20}
      fontWeight="600"
      color={sheet ? 'var(--text-tertiary)' : 'var(--foreground)'}
    >
      {children}
    </Text>
  );
}

/** A menu's columns: the lead column in display type, the rest as lists. */
function Columns({ menu, onPick }: { menu: Menu; onPick: () => void }) {
  const [hot, setHot] = useState<number | null>(null);
  return (
    <View
      display="grid"
      gridAutoFlow="column"
      gridAutoColumns="max-content"
      justify="flex-start"
      gap="max(24px, min(3vw, 64px))"
      pt={36}
      pb={48}
      px="calc(var(--page-gutter) + 8px)"
    >
      {menu.groups.map((group, i) => (
        <YStack
          key={group.title}
          gap={2}
          minW={0}
          opacity={hot === null || hot === i ? 1 : 0.45}
          transition="quickest"
          onPointerEnter={() => setHot(i)}
          onPointerLeave={() => setHot(null)}
        >
          <Title>{group.title}</Title>
          {group.links.map((link) => (
            <Row key={link.label} link={link} onClick={onPick} {...(group.lead ? LEAD : PLAIN)} />
          ))}
        </YStack>
      ))}
    </View>
  );
}

const node = (el: GuiElement | null) => (el instanceof HTMLElement ? el : null);

/** What the bar reads off a pointer: gui hands the web's own event through. */
const mouse = (e: object) => (e as { pointerType?: string }).pointerType === 'mouse';
type Key = { key?: string; preventDefault: () => void };

export function Header() {
  const [open, setOpen] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const [search, setSearch] = useState(false);
  const [grounded, setGrounded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pinned = useRef(false);
  const bar = useRef<GuiElement>(null);
  const toggle = useRef<GuiElement>(null);

  const close = useCallback(() => {
    clearTimeout(timer.current);
    pinned.current = false;
    setOpen(null);
  }, []);

  useEffect(() => {
    const read = () => setGrounded(window.scrollY > 4);
    read();
    window.addEventListener('scroll', read, { passive: true });
    return () => window.removeEventListener('scroll', read);
  }, []);

  useEffect(() => {
    if (!open && !sheet) return;
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (open) {
        node(bar.current)?.querySelector<HTMLElement>(`[aria-controls="menu-${open}"]`)?.focus();
        close();
      }
      if (sheet) {
        setSheet(false);
        node(toggle.current)?.focus();
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open, sheet, close]);

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!node(bar.current)?.contains(e.target as Node)) close();
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open, close]);

  useEffect(() => {
    if (!sheet) return;
    const root = document.documentElement;
    root.style.overflow = 'hidden';
    const wide = matchMedia('(min-width: 1024px)');
    const grow = () => wide.matches && setSheet(false);
    wide.addEventListener('change', grow);
    return () => {
      root.style.overflow = '';
      wide.removeEventListener('change', grow);
    };
  }, [sheet]);

  const rest = (id: string) => (e: object) => {
    if (!mouse(e)) return;
    clearTimeout(timer.current);
    if (open === id) return;
    if (open) {
      pinned.current = false;
      setOpen(id);
    } else timer.current = setTimeout(() => setOpen(id), REST);
  };
  const leave = (e: object) => {
    if (!mouse(e) || pinned.current) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(null), GRACE);
  };
  const press = (id: string) => () => {
    clearTimeout(timer.current);
    if (open === id && pinned.current) return close();
    pinned.current = true;
    setOpen(id);
  };
  const step = (id: string) => (e: Key) => {
    if (e.key !== 'ArrowDown') return;
    e.preventDefault();
    pinned.current = true;
    setOpen(id);
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`#menu-${id} a`)?.focus());
  };
  const blur = (e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close();
  };
  const find = () => {
    close();
    setSheet(false);
    setSearch(true);
  };

  const lit = (id: string) => (open === id ? LIT : {});

  const menu = (item: Menu, trigger: ReactNode) => (
    <XStack position="relative" onPointerEnter={rest(item.id)} onPointerLeave={leave} onBlur={blur}>
      {trigger}
      {open === item.id ? (
        <YStack
          id={`menu-${item.id}`}
          role="group"
          aria-label={item.label}
          position="fixed"
          t={UNDER}
          l={0}
          r={0}
          z={60}
          maxH={`calc(100dvh - ${HEADER}px)`}
          overflowY="auto"
          bg={PANEL}
          boxShadow={DROP}
          {...ARRIVE}
        >
          <Columns menu={item} onPick={close} />
        </YStack>
      ) : null}
    </XStack>
  );

  const trigger = (item: Menu) => (
    <Text
      render="button"
      {...TRIGGER}
      {...lit(item.id)}
      aria-expanded={open === item.id}
      aria-controls={`menu-${item.id}`}
      onClick={press(item.id)}
      onKeyDown={step(item.id)}
    >
      <Mark name={item.glyph} bar />
      {item.label}
      <Chevron turned={open === item.id} />
    </Text>
  );

  const lifted = open !== null || sheet;
  return (
    <>
      <XStack
        ref={bar}
        render="header"
        {...BAR}
        bg={lifted ? PANEL : grounded ? GLASS : 'transparent'}
        backdropFilter={!lifted && grounded ? BLUR : 'none'}
        transition="quickest"
      >
        {menu(
          COMPANY,
          <XStack render="span" {...BRAND} {...(open === COMPANY.id ? { bg: WASH, boxShadow: RING } : {})}>
            <Anchor href="/" aria-label="Hanzo Gallery home" {...NAME} $lg={{ pr: 0 }}>
              <HanzoWordmark label="Hanzo Gallery" size={22} />
            </Anchor>
            <Text
              render="button"
              aria-label="Company"
              aria-expanded={open === COMPANY.id}
              aria-controls={`menu-${COMPANY.id}`}
              onClick={press(COMPANY.id)}
              onKeyDown={step(COMPANY.id)}
              display="none"
              $lg={{ display: 'grid' }}
              placeItems="center"
              width={30}
              height="100%"
              p={0}
              pr={6}
              borderWidth={0}
              borderTopRightRadius={999}
              borderBottomRightRadius={999}
              bg="transparent"
              color="var(--foreground)"
              cursor="pointer"
            >
              <Chevron turned={open === COMPANY.id} />
            </Text>
          </XStack>,
        )}
        <XStack render="nav" aria-label="Main" display="none" $lg={{ display: 'flex' }} items="center" gap={2}>
          {MENUS.map((item) => (
            <Fragment key={item.id}>{menu(item, trigger(item))}</Fragment>
          ))}
        </XStack>
        {open && open !== 'login' ? (
          <View
            aria-hidden
            onPress={close}
            position="fixed"
            t={UNDER}
            l={0}
            r={0}
            b={0}
            z={40}
            bg="$black/40"
            backdropFilter="blur(24px) saturate(1.2)"
          />
        ) : null}
        <Text
          render="button"
          aria-label="Search the gallery and Hanzo, or ask AI"
          onClick={find}
          {...PILL}
          justify="center"
          width={44}
          height={44}
          ml="auto"
          $lg={{ width: 34, height: 34, ml: 0 }}
        >
          <MARKS.search size={16} />
        </Text>
        <XStack items="center" gap={8} $lg={{ ml: 'auto' }}>
          <XStack position="relative" display="none" $lg={{ display: 'flex' }} onPointerEnter={rest('login')} onPointerLeave={leave} onBlur={blur}>
            <Text
              render="button"
              {...TRIGGER}
              {...lit('login')}
              aria-expanded={open === 'login'}
              aria-controls="menu-login"
              onClick={press('login')}
              onKeyDown={step('login')}
            >
              Log in
              <Chevron turned={open === 'login'} />
            </Text>
            {open === 'login' ? (
              <YStack
                id="menu-login"
                role="group"
                aria-label="Log in"
                position="absolute"
                t="calc(100% + 8px)"
                r={0}
                display="grid"
                gap={2}
                minW={240}
                p={6}
                borderWidth={1}
                borderColor="var(--border)"
                rounded={12}
                bg={PANEL}
                boxShadow={DROP}
                {...ARRIVE}
              >
                {LOGIN.map((link) => (
                  <Anchor
                    key={link.label}
                    href={at(link.href, ORIGIN)}
                    target={away(link.href) ? '_blank' : undefined}
                    rel={away(link.href) ? 'noreferrer' : undefined}
                    onClick={close}
                    display="grid"
                    gap={2}
                    py={8}
                    px={10}
                    rounded={8}
                    color="var(--foreground)"
                    fontSize="$2"
                    lineHeight={20}
                    fontWeight="600"
                    textDecorationLine="none"
                    hoverStyle={{ bg: WASH }}
                    focusVisibleStyle={{ bg: WASH }}
                  >
                    {link.label}
                    <Text render="small" fontSize="$1" lineHeight={20} fontWeight="400" color="var(--muted-foreground)">
                      {link.hint}
                    </Text>
                  </Anchor>
                ))}
              </YStack>
            ) : null}
          </XStack>
          <Row link={TRY} {...ACT} display="none" $lg={{ display: 'flex' }} />
          <Text
            ref={toggle}
            render="button"
            aria-label={sheet ? 'Close menu' : 'Open menu'}
            aria-expanded={sheet}
            aria-controls="sheet"
            onClick={() => {
              close();
              setSheet((s) => !s);
            }}
            display="grid"
            $lg={{ display: 'none' }}
            placeItems="center"
            width={44}
            height={44}
            p={0}
            mr={-10}
            borderWidth={0}
            bg="transparent"
            color="var(--foreground)"
            cursor="pointer"
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <path d={sheet ? 'M6 6l12 12M18 6L6 18' : 'M3 9h18M3 15h18'} />
            </svg>
          </Text>
        </XStack>
      </XStack>
      {sheet ? <Sheet onClose={() => setSheet(false)} /> : null}
      <HanzoCommandPalette commands={COMMANDS} open={search} onOpenChange={setSearch} />
    </>
  );
}

/** The phone's menu: the whole tree, one section open at a time, then Log in and Try Hanzo. */
function Sheet({ onClose }: { onClose: () => void }) {
  const first = useRef<GuiElement>(null);
  const [section, setSection] = useState<string | null>(null);
  useEffect(() => node(first.current)?.focus(), []);
  return (
    <View
      id="sheet"
      role="dialog"
      aria-modal
      aria-label="Menu"
      display="block"
      position="fixed"
      t={UNDER}
      l={0}
      r={0}
      b={0}
      z={70}
      overflowY="auto"
      pt={4}
      px="var(--page-gutter)"
      pb="calc(24px + env(safe-area-inset-bottom))"
      bg={PANEL}
      {...ARRIVE}
    >
      <View render="nav" aria-label="Main" display="block">
        {[COMPANY, ...MENUS].map((item, i) => (
          <View
            key={item.id}
            render={
              <details
                name="sheet"
                onToggle={(e) => {
                  const now = e.currentTarget.open;
                  setSection((s) => (now ? item.id : s === item.id ? null : s));
                }}
              />
            }
            display="block"
            borderBottomWidth={1}
            borderColor="var(--border)"
          >
            <Text
              ref={i === 0 ? first : undefined}
              render="summary"
              display="flex"
              items="center"
              gap={10}
              minH={56}
              fontSize="$6"
              lineHeight={20}
              fontWeight="500"
              color="var(--foreground)"
              cursor="pointer"
            >
              <Mark name={item.glyph} />
              {item.label}
              <Chevron turned={section === item.id} end />
            </Text>
            {item.groups.map((group) => (
              <YStack key={group.title} gap={2} minW={0} pb={16}>
                <Title sheet>{group.title}</Title>
                {group.links.map((link) => (
                  <Row
                    key={link.label}
                    link={link}
                    onClick={onClose}
                    {...LINE}
                    fontSize={group.lead ? '$6' : '$4'}
                    lineHeight={group.lead ? 20.4 : 18}
                  />
                ))}
              </YStack>
            ))}
          </View>
        ))}
      </View>
      <View display="grid" gap={4} pt={20}>
        <Title sheet>Log in</Title>
        {LOGIN.map((link) => (
          <Row key={link.label} link={link} onClick={onClose} {...DOOR} />
        ))}
        <Row link={TRY} onClick={onClose} {...ACT} height={48} mt={12} fontSize="$3" />
      </View>
    </View>
  );
}
