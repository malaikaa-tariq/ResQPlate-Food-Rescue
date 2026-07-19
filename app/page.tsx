"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import {
  BrowserMultiFormatReader,
  type IScannerControls,
} from "@zxing/browser";

import { AppProvider, useApp } from "./state/AppContext";
import { store, type AppDispatch, type RootState } from "./state/store";
import {
  addInventory,
  removeInventory,
} from "./state/inventorySlice";
import {
  claimDonation,
  loadNearbyDonations,
  postDonation,
} from "./state/donationsSlice";
import {
  createRequest,
  updateRequest,
} from "./state/requestsSlice";
import { fetchRecipes } from "./state/recipesSlice";
import {
  dijkstra,
  type WeightedGraph,
} from "./lib/shortestPath";

type PageName =
  | "overview"
  | "inventory"
  | "donations"
  | "requests"
  | "recipes"
  | "impact";

type NavItem = [
  id: PageName,
  label: string,
  icon: string,
];

const nav: NavItem[] = [
  ["overview", "overview", "⌂"],
  ["inventory", "pantry", "▤"],
  ["donations", "map", "⌖"],
  ["requests", "pickups", "↗"],
  ["recipes", "recipes", "✦"],
  ["impact", "impact", "◒"],
];

function Shell() {
  const [page, setPage] = useState<PageName>("overview");
  const [menu, setMenu] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const {
    theme,
    toggleTheme,
    location,
    lang,
    setLang,
    t,
  } = useApp();

  const inventory = useSelector(
    (state: RootState) => state.inventory.items,
  );

  const donations = useSelector(
    (state: RootState) => state.donations.items,
  );

  const requests = useSelector(
    (state: RootState) => state.requests.items,
  );

  const expiring = inventory.filter(
    (item) => item.days <= 3,
  ).length;

  const content: Record<PageName, ReactNode> = {
    overview: (
      <Overview
        go={setPage}
        expiring={expiring}
        donations={donations.length}
        requests={requests.length}
      />
    ),
    inventory: <Inventory />,
    donations: <Donations />,
    requests: <Requests />,
    recipes: <Recipes />,
    impact: <Impact />,
  };

  return (
    <div className={theme === "dark" ? "app dark" : "app"}>
      <aside className={menu ? "sidebar open" : "sidebar"}>
        <button
          className="close"
          onClick={() => setMenu(false)}
          aria-label="Close navigation"
        >
          ×
        </button>

        <div className="brand">
          <Image
            className="brandmark"
            src="/resqplate-logo.svg"
            alt="ResQPlate"
            width={38}
            height={38}
            priority
          />

          <div>
            <b>ResQPlate</b>
            <small>Food worth saving</small>
          </div>
        </div>

        <div className="impact-mini">
          <span>COMMUNITY IMPACT</span>

          <strong>
            1,284 <small>meals rescued</small>
          </strong>

          <div>
            <i style={{ width: "72%" }} />
          </div>
        </div>

        <nav>
          {nav.map(([id, label, icon]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => {
                setPage(id);
                setMenu(false);
              }}
            >
              <span>{icon}</span>
              {t(label)}

              {id === "inventory" && expiring > 0 ? (
                <em>{expiring}</em>
              ) : null}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header>
          <button
            className="hamburger"
            onClick={() => setMenu(true)}
            aria-label="Open navigation"
          >
            ☰
          </button>

          <div className="search">
            ⌕
            <input
              aria-label="Search"
              placeholder={t("search")}
            />
          </div>

          <button
            className="location-btn"
            onClick={() => setLocationOpen(true)}
          >
            ⌖ <span>{location}</span>
          </button>

          <select
            className="language"
            aria-label="Language"
            value={lang}
            onChange={(event) => setLang(event.target.value)}
          >
            <option value="en">English</option>
            <option value="ur">اردو</option>
            <option value="pa">ਪੰਜਾਬੀ</option>
            <option value="sd">سنڌي</option>
            <option value="ps">پښتو</option>
            <option value="ar">العربية</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>

          <button
            className="iconbtn notification-btn"
            aria-label="Expiry notifications"
            aria-expanded={notificationsOpen}
            onClick={() =>
              setNotificationsOpen((value) => !value)
            }
          >
            ♢
            <span className="dot" />
          </button>

          <button
            className="iconbtn"
            aria-label="Switch theme"
            onClick={toggleTheme}
          >
            {theme === "dark" ? "☀" : "◐"}
          </button>

          {notificationsOpen && (
            <NotificationPanel
              items={inventory}
              close={() => setNotificationsOpen(false)}
              go={setPage}
            />
          )}
        </header>

        <div className="content">{content[page]}</div>
      </main>

      {locationOpen && (
        <LocationFinder
          close={() => setLocationOpen(false)}
        />
      )}

      <RescueCursor />
    </div>
  );
}

type OverviewProps = {
  go: (page: PageName) => void;
  expiring: number;
  donations: number;
  requests: number;
};

function Overview({
  go,
  expiring,
  donations,
  requests,
}: OverviewProps) {
  const { t, location } = useApp();

  const inventory = useSelector(
    (state: RootState) => state.inventory.items,
  );

  const total = inventory.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <>
      <div className="welcome">
        <div>
          <span className="eyebrow">
            LIVE IN {location.toUpperCase()}
          </span>

          <h1>{t("morning")}</h1>
          <p>{t("attention")}</p>
        </div>

        <button
          className="primary"
          onClick={() => go("donations")}
        >
          ＋ {t("rescue")}
        </button>
      </div>

      <StoryCarousel
        go={go}
        expiring={expiring}
      />

      <div className="stats">
        <Stat
          icon="▤"
          value={total}
          label="Items in pantry"
          note={`${expiring} need attention`}
          tone="orange"
        />

        <Stat
          icon="♡"
          value={donations}
          label="Nearby rescues"
          note="Within 5 km"
          tone="green"
        />

        <Stat
          icon="↗"
          value={requests}
          label="Active pickups"
          note="Community coordinated"
          tone="blue"
        />

        <Stat
          icon="◒"
          value="8.6 kg"
          label="Waste prevented"
          note="+18% this month"
          tone="purple"
        />
      </div>

      <div className="grid-two">
        <section className="panel">
          <PanelTitle
            title={t("useSoon")}
            sub="Items closest to expiry"
            action="View pantry"
            onClick={() => go("inventory")}
          />

          <div className="food-list">
            {inventory.slice(0, 3).map((item) => (
              <div
                className="food-row"
                key={item.id}
              >
                <span
                  className={`food-icon ${item.color}`}
                >
                  {item.emoji}
                </span>

                <div>
                  <b>{item.name}</b>

                  <small>
                    {item.quantity} {item.unit} ·{" "}
                    {item.category}
                  </small>
                </div>

                <strong
                  className={
                    item.days <= 1 ? "urgent" : "soon"
                  }
                >
                  {item.days <= 0
                    ? "Today"
                    : item.days === 1
                      ? "Tomorrow"
                      : `${item.days} days`}
                </strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <PanelTitle
            title={t("near")}
            sub={`Fresh listings around ${location}`}
            action="Open map"
            onClick={() => go("donations")}
          />

          <GlobalMap compact />
        </section>
      </div>

      <section className="how">
        <div>
          <span className="eyebrow">
            ONE PLATE AT A TIME
          </span>

          <h2>Rescue food in three simple steps</h2>
        </div>

        <div className="steps">
          <Step
            n="01"
            title="Spot it"
            text="Track expiry dates or find safe surplus nearby."
          />

          <Step
            n="02"
            title="Share it"
            text="Post a donation or request a community pickup."
          />

          <Step
            n="03"
            title="Save it"
            text="Cook, collect, and record your rescued impact."
          />
        </div>
      </section>
    </>
  );
}

type StatProps = {
  icon: string;
  value: string | number;
  label: string;
  note: string;
  tone: string;
};

function Stat({
  icon,
  value,
  label,
  note,
  tone,
}: StatProps) {
  return (
    <div className="stat">
      <span className={`stat-icon ${tone}`}>
        {icon}
      </span>

      <div>
        <strong>{value}</strong>
        <b>{label}</b>
        <small>{note}</small>
      </div>
    </div>
  );
}

type PanelTitleProps = {
  title: string;
  sub: string;
  action: string;
  onClick: () => void;
};

function PanelTitle({
  title,
  sub,
  action,
  onClick,
}: PanelTitleProps) {
  return (
    <div className="panel-title">
      <div>
        <h3>{title}</h3>
        <p>{sub}</p>
      </div>

      <button onClick={onClick}>
        {action} →
      </button>
    </div>
  );
}

type StepProps = {
  n: string;
  title: string;
  text: string;
};

function Step({ n, title, text }: StepProps) {
  return (
    <div className="step">
      <span>{n}</span>

      <div>
        <b>{title}</b>
        <p>{text}</p>
      </div>
    </div>
  );
}

type NotificationItem = {
  id: string;
  name: string;
  days: number;
  emoji: string;
};

type NotificationPanelProps = {
  items: NotificationItem[];
  close: () => void;
  go: (page: PageName) => void;
};

function NotificationPanel({
  items,
  close,
  go,
}: NotificationPanelProps) {
  const urgent = items.filter(
    (item) => item.days <= 3,
  );

  return (
    <aside className="notification-panel">
      <div className="notification-head">
        <div>
          <span className="eyebrow">
            USE-SOON ALERTS
          </span>

          <h3>
            {urgent.length} items need attention
          </h3>
        </div>

        <button
          onClick={close}
          aria-label="Close notifications"
        >
          ×
        </button>
      </div>

      <div className="notification-list">
        {urgent.map((item) => (
          <div key={item.id}>
            <span>{item.emoji}</span>

            <div>
              <b>{item.name}</b>

              <small>
                {item.days <= 0
                  ? "Expires today"
                  : item.days === 1
                    ? "Expires tomorrow"
                    : `Expires in ${item.days} days`}
              </small>
            </div>

            <em
              className={
                item.days <= 1 ? "urgent" : "soon"
              }
            >
              {item.days <= 1 ? "Urgent" : "Soon"}
            </em>
          </div>
        ))}
      </div>

      <button
        className="notification-action"
        onClick={() => {
          go("inventory");
          close();
        }}
      >
        Review my pantry →
      </button>
    </aside>
  );
}

type StoryCarouselProps = {
  go: (page: PageName) => void;
  expiring: number;
};

function StoryCarousel({
  go,
  expiring,
}: StoryCarouselProps) {
  const { t } = useApp();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSlide((current) => (current + 1) % 3);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const stories: Array<{
    tag: string;
    title: string;
    text: string;
    button: string;
    page: PageName;
    image: string;
  }> = [
    {
      tag: t("mission"),
      title: t("save"),
      text: `You have ${expiring} items expiring soon. Cook them, share them, or donate safely.`,
      button: t("review"),
      page: "inventory",
      image: "/images/resqplate-hero.png",
    },
    {
      tag: "NEIGHBOURS HELPING NEIGHBOURS",
      title: "Food rescue feels better together.",
      text: "Discover surplus meals and coordinate a respectful pickup in your own city.",
      button: "Explore nearby rescues",
      page: "donations",
      image: "/images/resqplate-donation.png",
    },
    {
      tag: "COOK WHAT YOU HAVE",
      title:
        "Turn ‘use soon’ into tonight’s favourite.",
      text: "Match expiring ingredients with flexible, waste-smart recipe ideas.",
      button: t("findRecipe"),
      page: "recipes",
      image: "/images/resqplate-recipe.png",
    },
  ];

  const currentStory = stories[slide];

  return (
    <section
      className="hero-card photo-hero"
      style={{
        backgroundImage: `linear-gradient(
          90deg,
          rgba(6, 49, 37, 0.94),
          rgba(8, 59, 44, 0.64),
          rgba(8, 59, 44, 0.12)
        ), url("${currentStory.image}")`,
      }}
    >
      <div>
        <span className="tag">
          {currentStory.tag}
        </span>

        <h2>{currentStory.title}</h2>
        <p>{currentStory.text}</p>

        <div className="hero-actions">
          <button
            onClick={() => go(currentStory.page)}
          >
            {currentStory.button} →
          </button>
        </div>
      </div>

      <div className="carousel-dots">
        {stories.map((story, index) => (
          <button
            type="button"
            aria-label={`Show story ${index + 1}`}
            className={index === slide ? "on" : ""}
            onClick={() => setSlide(index)}
            key={story.title}
          />
        ))}
      </div>
    </section>
  );
}

type GlobalMapProps = {
  compact?: boolean;
  destination?: string;
};

function GlobalMap({
  compact = false,
  destination,
}: GlobalMapProps) {
  const { location } = useApp();

  const query = encodeURIComponent(
    `${location} food rescue`,
  );

  const route = destination
    ? `https://www.google.com/maps?output=embed&saddr=${encodeURIComponent(
        location,
      )}&daddr=${encodeURIComponent(destination)}`
    : `https://www.google.com/maps?q=${query}&output=embed`;

  const external = destination
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        location,
      )}&destination=${encodeURIComponent(
        destination,
      )}`
    : `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <div
      className={
        compact
          ? "map-embed compact"
          : "map-embed"
      }
    >
      <iframe
        title={
          destination
            ? `Shortest route from ${location} to ${destination}`
            : `Food rescue map for ${location}`
        }
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={route}
      />

      <a
        href={external}
        target="_blank"
        rel="noreferrer"
      >
        {destination
          ? "Open route in Google Maps"
          : "Open in Google Maps"}{" "}
        ↗
      </a>
    </div>
  );
}

type LocationResult = {
  display_name: string;
  lat: string;
  lon: string;
};

function LocationFinder({
  close,
}: {
  close: () => void;
}) {
  const { location, setLocation } = useApp();

  const [query, setQuery] = useState(location);
  const [results, setResults] = useState<
    LocationResult[]
  >([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (query.trim().length < 2) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encodeURIComponent(
          query,
        )}`,
        {
          headers: {
            "Accept-Language": "en",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Location search failed.");
      }

      const data =
        (await response.json()) as LocationResult[];

      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } =
          position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );

          if (!response.ok) {
            throw new Error(
              "Reverse location lookup failed.",
            );
          }

          const data = (await response.json()) as {
            display_name?: string;
          };

          setLocation(
            data.display_name ??
              `${latitude}, ${longitude}`,
          );

          close();
        } catch {
          setLocation(`${latitude}, ${longitude}`);
          close();
        }
      },
    );
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
    >
      <section className="location-modal">
        <button
          className="modal-close"
          onClick={close}
          aria-label="Close location finder"
        >
          ×
        </button>

        <span className="eyebrow">
          WORLDWIDE DISCOVERY
        </span>

        <h2>Where are you rescuing food?</h2>

        <p>
          Search any country, city, town, district,
          or neighbourhood in the world.
        </p>

        <div className="location-search">
          <input
            autoFocus
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void search();
              }
            }}
            placeholder="e.g. Barcelona, Spain"
          />

          <button onClick={() => void search()}>
            {loading ? "Searching…" : "Search world"}
          </button>
        </div>

        <button
          className="detect"
          onClick={detectLocation}
        >
          ◎ Use my live location
        </button>

        <div className="location-results">
          {results.map((result) => (
            <button
              key={`${result.lat}-${result.lon}`}
              onClick={() => {
                setLocation(result.display_name);
                close();
              }}
            >
              <span>⌖</span>

              <div>
                <b>
                  {result.display_name.split(",")[0]}
                </b>

                <small>{result.display_name}</small>
              </div>

              <em>Choose</em>
            </button>
          ))}
        </div>

        <small className="privacy">
          Location is used to personalise nearby
          rescue discovery. You stay in control.
        </small>
      </section>
    </div>
  );
}

function RescueCursor() {
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(pointer: coarse)",
    );

    if (mediaQuery.matches) {
      return undefined;
    }

    const halo = document.createElement("div");
    const dot = document.createElement("div");

    halo.className = "rescue-cursor";
    dot.className = "rescue-dot";

    document.body.append(halo, dot);

    const move = (event: MouseEvent) => {
      const position = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;

      dot.style.transform = position;
      halo.style.transform = position;
    };

    window.addEventListener("mousemove", move, {
      passive: true,
    });

    return () => {
      window.removeEventListener("mousemove", move);
      halo.remove();
      dot.remove();
    };
  }, []);

  return null;
}

function Inventory() {
  const dispatch = useDispatch<AppDispatch>();

  const items = useSelector(
    (state: RootState) => state.inventory.items,
  );

  const [name, setName] = useState("");
  const [days, setDays] = useState(3);
  const [scanner, setScanner] = useState(false);

  const addItem = () => {
    const foodName = name.trim();

    if (!foodName) {
      return;
    }

    dispatch(
      addInventory({
        name: foodName,
        days,
      }),
    );

    setName("");
  };

  return (
    <Page
      title="My pantry"
      sub="Track what you have. Waste less of what you buy."
      badge={`${
        items.filter((item) => item.days <= 3).length
      } need attention`}
    >
      <div className="toolbar">
        <div className="scan-box pantry-banner">
          <div>
            <b>Scan it. Store it. Save it.</b>

            <small>
              Use your camera or enter a barcode to
              find the real product in Open Food Facts.
            </small>
          </div>

          <button onClick={() => setScanner(true)}>
            Scan barcode
          </button>
        </div>
      </div>

      <div className="split">
        <section className="panel">
          <h3>Add an item</h3>

          <div className="form-grid">
            <label>
              Food name

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Spinach"
              />
            </label>

            <label>
              Expires in

              <select
                value={days}
                onChange={(event) =>
                  setDays(Number(event.target.value))
                }
              >
                <option value={0}>Today</option>
                <option value={1}>Tomorrow</option>
                <option value={3}>3 days</option>
                <option value={7}>7 days</option>
              </select>
            </label>

            <button
              className="primary"
              onClick={addItem}
            >
              ＋ Add to pantry
            </button>
          </div>
        </section>

        <section className="panel inventory-list">
          <h3>
            Your food{" "}
            <small>{items.length} items</small>
          </h3>

          {items.map((item) => (
            <div
              className="inv-card"
              key={item.id}
            >
              <span
                className={`food-icon ${item.color}`}
              >
                {item.emoji}
              </span>

              <div>
                <b>{item.name}</b>

                <small>
                  {item.quantity} {item.unit} · Added
                  recently
                </small>
              </div>

              <span
                className={
                  item.days <= 1
                    ? "pill urgent"
                    : "pill soon"
                }
              >
                {item.days <= 0
                  ? "Use today"
                  : `${item.days} days left`}
              </span>

              <button
                onClick={() =>
                  dispatch(removeInventory(item.id))
                }
                aria-label={`Remove ${item.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </section>
      </div>

      {scanner && (
        <BarcodeScanner
          close={() => setScanner(false)}
          add={(product) => {
            dispatch(
              addInventory({
                name: product,
                days: 7,
              }),
            );

            setScanner(false);
          }}
        />
      )}
    </Page>
  );
}

type BarcodeScannerProps = {
  close: () => void;
  add: (name: string) => void;
};

function BarcodeScanner({
  close,
  add,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const controlsRef =
    useRef<IScannerControls | null>(null);

  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState(
    "Choose camera scanning or enter the number printed below the barcode.",
  );

  const stopCamera = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;

    const stream = videoRef.current
      ?.srcObject as MediaStream | null;

    stream
      ?.getTracks()
      .forEach((track) => track.stop());
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const lookup = async (code = barcode) => {
    const clean = code.replace(/\D/g, "");

    if (clean.length < 8) {
      setStatus(
        "Enter a valid barcode containing at least 8 digits.",
      );

      return;
    }

    setLoading(true);
    setStatus("Searching Open Food Facts…");

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${clean}.json`,
      );

      if (!response.ok) {
        throw new Error("Product lookup failed.");
      }

      const data = (await response.json()) as {
        status?: number;
        product?: {
          product_name_en?: string;
          product_name?: string;
          generic_name?: string;
        };
      };

      if (data.status === 1 && data.product) {
        const productName =
          data.product.product_name_en ||
          data.product.product_name ||
          data.product.generic_name ||
          `Product ${clean}`;

        setStatus(`Found: ${productName}`);
        add(productName);
      } else {
        setStatus(
          "Product not found. Check the digits or add the item manually.",
        );
      }
    } catch {
      setStatus(
        "Product lookup is unavailable right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    if (
      !navigator.mediaDevices?.getUserMedia ||
      !videoRef.current
    ) {
      setStatus(
        "Camera access is unavailable. Use manual barcode entry below.",
      );

      return;
    }

    try {
      stopCamera();
      setStatus("Starting camera…");

      const reader =
        new BrowserMultiFormatReader();

      controlsRef.current =
        await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (!result) {
              return;
            }

            const code = result.getText();

            setBarcode(code);
            stopCamera();
            void lookup(code);
          },
        );

      setStatus(
        "Point the camera at the barcode and hold it steady.",
      );
    } catch {
      setStatus(
        "Camera permission was denied or no camera was found. Manual barcode entry still works.",
      );
    }
  };

  return (
    <div className="modal-backdrop">
      <section className="scanner-modal">
        <button
          className="modal-close"
          onClick={() => {
            stopCamera();
            close();
          }}
          aria-label="Close scanner"
        >
          ×
        </button>

        <span className="eyebrow">
          REAL PRODUCT LOOKUP
        </span>

        <h2>Scan a food barcode</h2>

        <p>
          Cross-browser scanning supports EAN, UPC,
          Code 128 and other common product formats.
        </p>

        <div className="scanner-view">
          <video
            ref={videoRef}
            muted
            playsInline
          />

          <div className="scan-line" />

          <span>
            Keep the barcode inside the frame
          </span>
        </div>

        <button
          className="camera-button"
          onClick={() => void startCamera()}
        >
          ▦ Start camera scanner
        </button>

        <div className="barcode-entry">
          <label>
            Barcode number

            <input
              inputMode="numeric"
              value={barcode}
              onChange={(event) =>
                setBarcode(event.target.value)
              }
              placeholder="e.g. 3017620422003"
            />
          </label>

          <button
            disabled={loading}
            onClick={() => void lookup()}
          >
            {loading
              ? "Searching…"
              : "Find product"}
          </button>
        </div>

        <p
          className="scanner-status"
          role="status"
        >
          {status}
        </p>

        <small className="scanner-note">
          Product data comes from the public Open
          Food Facts catalogue.
        </small>
      </section>
    </div>
  );
}

function Donations() {
  const dispatch = useDispatch<AppDispatch>();

  const { items, status } = useSelector(
    (state: RootState) => state.donations,
  );

  const { location } = useApp();

  const [show, setShow] = useState(false);

  const [
    routeDestination,
    setRouteDestination,
  ] = useState("Green Table Café");

  return (
    <Page
      title="Rescue map"
      sub={`Discover food and calculate the most efficient pickup path near ${location}.`}
      badge="Smart route planning"
    >
      <div className="toolbar">
        <button
          className="primary"
          onClick={() => setShow((value) => !value)}
        >
          ＋ Post surplus
        </button>

        <button
          className="secondary"
          onClick={() =>
            dispatch(loadNearbyDonations())
          }
        >
          {status === "loading"
            ? "Locating…"
            : "⌖ Refresh nearby"}
        </button>
      </div>

      {show && (
        <div className="quick-form">
          <b>Share food safely</b>

          <p>
            Add collection timing, allergens,
            storage conditions, and a clear handover
            point.
          </p>

          <button
            onClick={() => {
              dispatch(postDonation());
              setShow(false);
            }}
          >
            Post 6 bakery portions
          </button>
        </div>
      )}

      <RouteOptimizer
        goal={routeDestination}
        setGoal={setRouteDestination}
      />

      <div className="donation-layout">
        <GlobalMap
          destination={`${routeDestination}, ${location}`}
        />

        <div className="cards">
          {items.map((donation) => (
            <article
              className="donation"
              key={donation.id}
            >
              <div
                className={`donation-photo ${donation.photo}`}
                style={{
                  backgroundImage:
                    "url('/images/resqplate-donation.png')",
                }}
              >
                <em>{donation.distance}</em>
              </div>

              <div>
                <span className="tag">
                  {donation.type}
                </span>

                <h3>{donation.title}</h3>

                <p>
                  {donation.place} · {donation.time}
                </p>

                <div className="donor">
                  <span>{donation.initial}</span>

                  <small>
                    <b>{donation.donor}</b>
                    <br />
                    Safety details provided
                  </small>
                </div>

                <div className="donation-actions">
                  <button
                    disabled={!donation.available}
                    onClick={() =>
                      dispatch(
                        claimDonation(donation.id),
                      )
                    }
                  >
                    {donation.available
                      ? "Request pickup"
                      : "Requested ✓"}
                  </button>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${donation.place}, ${location}`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Directions ↗
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Page>
  );
}

type RouteOptimizerProps = {
  goal: string;
  setGoal: (destination: string) => void;
};

function RouteOptimizer({
  goal,
  setGoal,
}: RouteOptimizerProps) {
  const baseGraph: WeightedGraph = {
    "Your location": {
      "Community Hub": 1.2,
      "Clifton Bakehouse": 2.8,
      "City Food Bank": 4.4,
    },
    "Community Hub": {
      "Your location": 1.2,
      "Clifton Bakehouse": 0.9,
      "Green Table Café": 1.7,
      "Student Meal Point": 2.3,
    },
    "Clifton Bakehouse": {
      "Your location": 2.8,
      "Community Hub": 0.9,
      "Green Table Café": 1.1,
      "Neighbourhood Share": 2.2,
    },
    "Green Table Café": {
      "Community Hub": 1.7,
      "Clifton Bakehouse": 1.1,
      "Neighbourhood Share": 1.3,
      "City Food Bank": 2.1,
    },
    "Neighbourhood Share": {
      "Clifton Bakehouse": 2.2,
      "Green Table Café": 1.3,
      "Student Meal Point": 1.5,
    },
    "City Food Bank": {
      "Your location": 4.4,
      "Green Table Café": 2.1,
      "Student Meal Point": 1.2,
    },
    "Student Meal Point": {
      "Community Hub": 2.3,
      "Neighbourhood Share": 1.5,
      "City Food Bank": 1.2,
    },
  };

  const [graph, setGraph] =
    useState<WeightedGraph>(baseGraph);

  const [adding, setAdding] = useState(false);
  const [custom, setCustom] = useState("");
  const [distance, setDistance] = useState("3");

  const destinations = Object.keys(graph).filter(
    (destination) =>
      destination !== "Your location" &&
      destination !== "Community Hub",
  );

  const route = dijkstra(
    graph,
    "Your location",
    goal,
  );

  const modes = [
    {
      icon: "🚶",
      name: "Walk",
      speed: 5,
    },
    {
      icon: "🚲",
      name: "Bicycle",
      speed: 15,
    },
    {
      icon: "🛵",
      name: "Scooter",
      speed: 25,
    },
    {
      icon: "🚗",
      name: "Car",
      speed: 35,
    },
  ];

  const addDestination = () => {
    const name = custom.trim();
    const kilometres = Number(distance);

    if (
      !name ||
      !Number.isFinite(kilometres) ||
      kilometres <= 0
    ) {
      return;
    }

    setGraph((currentGraph) => ({
      ...currentGraph,
      "Your location": {
        ...currentGraph["Your location"],
        [name]: kilometres,
      },
      [name]: {
        "Your location": kilometres,
      },
    }));

    setGoal(name);
    setCustom("");
    setAdding(false);
  };

  return (
    <section className="route-optimizer">
      <div className="route-copy">
        <span className="route-symbol">⌁</span>

        <div>
          <span className="eyebrow">
            SHORTEST-PATH RESCUE PLANNER
          </span>

          <h3>
            See the fastest way to reach food.
          </h3>

          <p>
            Choose a saved pickup or add any
            destination. Dijkstra&apos;s algorithm
            finds the lowest-distance graph route and
            the map displays it.
          </p>
        </div>
      </div>

      <div className="route-controls">
        <div className="destination-row">
          <label>
            Pickup destination

            <select
              value={goal}
              onChange={(event) =>
                setGoal(event.target.value)
              }
            >
              {destinations.map((destination) => (
                <option
                  value={destination}
                  key={destination}
                >
                  {destination}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() =>
              setAdding((value) => !value)
            }
          >
            ＋ Add destination
          </button>
        </div>

        {adding && (
          <div className="custom-destination">
            <input
              value={custom}
              onChange={(event) =>
                setCustom(event.target.value)
              }
              placeholder="Pickup name or address"
            />

            <input
              value={distance}
              onChange={(event) =>
                setDistance(event.target.value)
              }
              inputMode="decimal"
              placeholder="Distance in km"
            />

            <button onClick={addDestination}>
              Add to route graph
            </button>
          </div>
        )}

        <div className="route-result">
          <span>
            {route.path.map((node, index) => (
              <span key={`${node}-${index}`}>
                <b>{node}</b>

                {index < route.path.length - 1 ? (
                  <i>→</i>
                ) : null}
              </span>
            ))}
          </span>

          <strong>
            {Number.isFinite(route.distance)
              ? route.distance.toFixed(1)
              : "0.0"}{" "}
            km

            <small>
              shortest calculated path
            </small>
          </strong>
        </div>

        <div className="travel-times">
          {modes.map((mode) => {
            const minutes = Number.isFinite(
              route.distance,
            )
              ? Math.max(
                  1,
                  Math.round(
                    (route.distance / mode.speed) * 60,
                  ),
                )
              : 0;

            return (
              <div key={mode.name}>
                <span>{mode.icon}</span>
                <b>{mode.name}</b>
                <strong>{minutes} min</strong>

                <small>
                  est. at {mode.speed} km/h
                </small>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Requests() {
  const dispatch = useDispatch<AppDispatch>();

  const items = useSelector(
    (state: RootState) => state.requests.items,
  );

  const statuses = [
    "Requested",
    "Confirmed",
    "Completed",
  ] as const;

  return (
    <Page
      title="Pickup requests"
      sub="Coordinate collections clearly, respectfully, and on time."
      badge={`${
        items.filter(
          (item) => item.status !== "Completed",
        ).length
      } active`}
    >
      <section className="pickup-banner">
        <div>
          <span className="eyebrow">
            COLLECT WITH CONFIDENCE
          </span>

          <h2>
            Every handover, clearly coordinated.
          </h2>

          <p>
            Keep addresses, time windows, food
            details, and collection status together
            from request to rescue.
          </p>
        </div>
      </section>

      <div className="request-board">
        {statuses.map((status) => (
          <section
            className="kanban"
            key={status}
          >
            <div className="kanban-head">
              <b>{status}</b>

              <span>
                {
                  items.filter(
                    (item) =>
                      item.status === status,
                  ).length
                }
              </span>
            </div>

            {items
              .filter(
                (item) => item.status === status,
              )
              .map((request) => (
                <article key={request.id}>
                  <span className="tag">
                    {request.kind}
                  </span>

                  <h3>{request.title}</h3>

                  <p>⌖ {request.location}</p>
                  <p>◷ {request.time}</p>

                  <div>
                    <span className="avatar small">
                      {request.initial}
                    </span>

                    <b>{request.person}</b>
                  </div>

                  {status !== "Completed" && (
                    <button
                      onClick={() =>
                        dispatch(
                          updateRequest(request.id),
                        )
                      }
                    >
                      {status === "Requested"
                        ? "Confirm pickup"
                        : "Mark collected"}{" "}
                      →
                    </button>
                  )}
                </article>
              ))}

            {status === "Requested" && (
              <button
                className="add-card"
                onClick={() =>
                  dispatch(createRequest())
                }
              >
                ＋ Add pickup request
              </button>
            )}
          </section>
        ))}
      </div>
    </Page>
  );
}

function Recipes() {
  const dispatch = useDispatch<AppDispatch>();

  const { items, status } = useSelector(
    (state: RootState) => state.recipes,
  );

  const pantry = useSelector(
    (state: RootState) => state.inventory.items,
  );

  const ingredients = useMemo(
    () =>
      pantry
        .filter((item) => item.days <= 3)
        .map((item) => item.name)
        .join(", "),
    [pantry],
  );

  return (
    <Page
      title="Recipe rescue"
      sub="Turn food that needs attention into something worth sharing."
      badge="Waste-smart ideas"
    >
      <section className="recipe-hero">
        <div>
          <span className="tag">
            SMART MATCH
          </span>

          <h2>Cook with what&apos;s expiring.</h2>

          <p>
            We found ingredients that need attention:{" "}
            <b>
              {ingredients || "No urgent ingredients"}
            </b>
            .
          </p>

          <button
            onClick={() =>
              dispatch(fetchRecipes(ingredients))
            }
          >
            {status === "loading"
              ? "Creating ideas…"
              : "Find recipe ideas"}
          </button>
        </div>
      </section>

      <div className="recipe-grid">
        {items.map((recipe) => (
          <article key={recipe.id}>
            <div
              className={`recipe-photo ${recipe.color}`}
            >
              <em>
                {recipe.match}% pantry match
              </em>
            </div>

            <div>
              <small>
                {recipe.time} · {recipe.level}
              </small>

              <h3>{recipe.title}</h3>
              <p>{recipe.description}</p>

              <div>
                {recipe.ingredients.map(
                  (ingredient) => (
                    <span
                      className="ingredient"
                      key={ingredient}
                    >
                      {ingredient}
                    </span>
                  ),
                )}
              </div>

              <button>
                View rescue recipe →
              </button>
            </div>
          </article>
        ))}
      </div>
    </Page>
  );
}

function Impact() {
  return (
    <Page
      title="Community impact"
      sub="See every saved plate turn into measurable local progress."
      badge="Growing together"
    >
      <section className="impact-hero">
        <div>
          <span className="eyebrow">
            GLOBAL RESCUE COLLECTIVE
          </span>

          <h2>
            Small rescues.
            <br />
            Planet-sized impact.
          </h2>

          <p>
            Every pantry item used, surplus box
            shared, and pickup completed strengthens
            the local food loop.
          </p>

          <button>
            Invite your community →
          </button>
        </div>

        <div className="impact-orbit">
          <strong>
            8.6
            <small>kg saved</small>
          </strong>
        </div>
      </section>

      <div className="impact-grid">
        <article>
          <strong>1,284</strong>
          <b>Meals rescued</b>

          <p>
            Enough food for a full school week.
          </p>
        </article>

        <article>
          <strong>312 kg</strong>
          <b>CO₂e avoided</b>

          <p>
            Estimated environmental benefit.
          </p>
        </article>

        <article>
          <strong>428</strong>
          <b>Neighbour connections</b>

          <p>
            Food shared with dignity nearby.
          </p>
        </article>

        <article>
          <strong>36</strong>
          <b>Local partners</b>

          <p>
            Cafés, shops, and community groups.
          </p>
        </article>
      </div>

      <section className="panel challenge">
        <span>
          WEEKLY COMMUNITY CHALLENGE
        </span>

        <h2>
          Rescue 500 breakfasts before Sunday
        </h2>

        <div>
          <i style={{ width: "68%" }} />
        </div>

        <p>
          <b>341 meals saved</b>
          <em>159 to go</em>
        </p>
      </section>
    </Page>
  );
}

type PageProps = {
  title: string;
  sub: string;
  badge: string;
  children: ReactNode;
};

function Page({
  title,
  sub,
  badge,
  children,
}: PageProps) {
  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">
            RESQPLATE WORKSPACE
          </span>

          <h1>{title}</h1>
          <p>{sub}</p>
        </div>

        <span className="status-badge">
          ● {badge}
        </span>
      </div>

      {children}
    </>
  );
}

export default function Home() {
  return (
    <Provider store={store}>
      <AppProvider>
        <Shell />
      </AppProvider>
    </Provider>
  );
}