import PageHeader from "@/src/components/PageHeader";
import { useAuth } from "@/src/contexts/AuthContext";
import { Sucursal, sucursales } from "@/src/data/sucursales";
import {
    deleteAddress,
    getUserAddresses,
    updateAddressLabel,
    UserAddress,
} from "@/src/services/usuarios-rtdb";
import { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapWebView from "./MapWebView";

// ─── Public types ──────────────────────────────────────────

export interface DeliveryInfo {
  mode: "recoger" | "delivery";
  sucursalId?: string;
  address?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  notes?: string;
}

interface DeliveryModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (info: DeliveryInfo) => void;
  total: number;
}

// ─── Main Modal ────────────────────────────────────────────

export default function DeliveryModal({
  visible,
  onClose,
  onConfirm,
  total,
}: DeliveryModalProps) {
  const [step, setStep] = useState<"choose" | "recoger" | "delivery">("choose");

  // Maneja el cierre del modal
  const handleClose = () => {
    setStep("choose");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      {step === "choose" && (
        <StepChoose
          onSelect={(mode) => setStep(mode)}
          onClose={handleClose}
          total={total}
        />
      )}
      {step === "recoger" && (
        <StepRecoger
          onBack={() => setStep("choose")}
          onConfirm={(sucursalId) => {
            onConfirm({ mode: "recoger", sucursalId });
            setStep("choose");
          }}
        />
      )}
      {step === "delivery" && (
        <StepDelivery
          onBack={() => setStep("choose")}
          onConfirm={(data) => {
            onConfirm({ mode: "delivery", ...data });
            setStep("choose");
          }}
        />
      )}
    </Modal>
  );
}

// ─── Step 1: Choose mode ──────────────────────────────────

function StepChoose({
  onSelect,
  onClose,
  total,
}: {
  onSelect: (mode: "recoger" | "delivery") => void;
  onClose: () => void;
  total: number;
}) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      <PageHeader
        title="¿Cómo quieres recibir tu pedido?"
        subtitle="Elige una opción para continuar"
        pt={32}
      />

      <View className="flex-1 justify-center px-6 gap-4">
        <TouchableOpacity
          onPress={() => onSelect("recoger")}
          className="flex-row items-center bg-surface-hover rounded-2xl p-5 border border-border active:opacity-80"
        >
          <View className="w-14 h-14 bg-success-light rounded-xl justify-center items-center mr-4">
            <Text className="text-2xl">🏪</Text>
          </View>
          <View className="flex-1">
            <Text className="text-body-bold text-text-primary">
              Recoger en tienda
            </Text>
            <Text className="text-caption text-text-muted mt-1">
              Elige la sucursal más cercana
            </Text>
          </View>
          <Text className="text-h3 text-success">Gratis</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSelect("delivery")}
          className="flex-row items-center bg-surface-hover rounded-2xl p-5 border border-border active:opacity-80"
        >
          <View className="w-14 h-14 bg-primary-light rounded-xl justify-center items-center mr-4">
            <Text className="text-2xl">🛵</Text>
          </View>
          <View className="flex-1">
            <Text className="text-body-bold text-text-primary">
              Delivery a tu dirección
            </Text>
            <Text className="text-caption text-text-muted mt-1">
              Te lo llevamos hasta tu puerta
            </Text>
          </View>
          <Text className="text-h3 text-primary">+S/.5</Text>
        </TouchableOpacity>
      </View>

      <View
        className="px-6 py-4 border-t border-border"
        style={{ paddingBottom: Platform.OS === "android" ? bottom + 8 : 16 }}
      >
        <TouchableOpacity onPress={onClose} className="py-3 items-center">
          <Text className="text-body text-text-secondary underline">
            Volver al carrito
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Step 2a: Recoger en tienda ───────────────────────────

function StepRecoger({
  onBack,
  onConfirm,
}: {
  onBack: () => void;
  onConfirm: (sucursalId: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const { bottom } = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      <View className="bg-primary pt-8 pb-6 px-6">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={onBack} className="mr-3">
            <Text className="text-text-inverse text-body-bold">←</Text>
          </TouchableOpacity>
          <Text className="text-h2 text-text-inverse">Elige tu sucursal</Text>
        </View>
        <Text className="text-body text-text-inverse opacity-80">
          Retira tu pedido sin costo
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{ gap: 12 }}
      >
        {sucursales.map((s) => (
          <SucursalCard
            key={s.id}
            sucursal={s}
            selected={selected === s.id}
            onSelect={() => setSelected(s.id)}
          />
        ))}
      </ScrollView>

      <View
        className="px-6 py-4 border-t border-border"
        style={{ paddingBottom: Platform.OS === "android" ? bottom + 8 : 16 }}
      >
        <TouchableOpacity
          onPress={() => selected && onConfirm(selected)}
          disabled={!selected}
          className="bg-primary py-4 rounded-xl items-center active:opacity-70"
          style={{ opacity: selected ? 1 : 0.4 }}
        >
          <Text className="text-text-inverse text-body-bold">
            Confirmar sucursal
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Tarjeta de selección de sucursal
function SucursalCard({
  sucursal,
  selected,
  onSelect,
}: {
  sucursal: Sucursal;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      className="rounded-2xl p-4 border-2 active:opacity-80"
      style={{
        backgroundColor: selected ? "#f0fdf4" : "#fafafa",
        borderColor: selected ? "#22c55e" : "#e5e7eb",
      }}
    >
      <View className="flex-row items-start">
        <View className="w-12 h-12 bg-success-light rounded-xl justify-center items-center mr-3">
          <Text className="text-xl">🏪</Text>
        </View>
        <View className="flex-1">
          <Text className="text-body-bold text-text-primary">
            {sucursal.name}
          </Text>
          <Text className="text-caption text-text-muted mt-1">
            📍 {sucursal.address}
          </Text>
          <Text className="text-caption text-text-muted mt-0.5">
            🕐 {sucursal.hours}
          </Text>
          <Text className="text-caption text-text-muted mt-0.5">
            📞 {sucursal.phone}
          </Text>
        </View>
        {selected && (
          <View className="w-6 h-6 bg-success rounded-full justify-center items-center">
            <Text className="text-white text-caption font-bold">✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Step 2b: Delivery ────────────────────────────────────

function StepDelivery({
  onBack,
  onConfirm,
}: {
  onBack: () => void;
  onConfirm: (data: {
    address: string;
    lat: number;
    lng: number;
    phone: string;
    notes: string;
  }) => void;
}) {
  const { user } = useAuth();
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(-12.046);
  const [lng, setLng] = useState(-77.043);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const { bottom } = useSafeAreaInsets();

  // Carga las direcciones guardadas del usuario
  const loadAddresses = () => {
    if (user?.uid) {
      getUserAddresses(user.uid).then(setSavedAddresses);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [user?.uid]);

  const canConfirm = address.length > 3 && phone.length >= 9;

  // Selecciona una dirección guardada
  const selectSaved = (addr: UserAddress, idx: number) => {
    setSelectedIdx(idx);
    setAddress(addr.address);
    setLat(addr.lat);
    setLng(addr.lng);
    setPhone(addr.phone);
    setNotes(addr.notes ?? "");
  };

  // Inicia el renombrado de una etiqueta
  const handleRename = (idx: number) => {
    setEditingIdx(idx);
    setEditingLabel(savedAddresses[idx].label);
  };

  // Guarda el nuevo nombre de la etiqueta
  const handleSaveRename = async () => {
    if (editingIdx === null || !user?.uid || !editingLabel.trim()) return;
    const oldLabel = savedAddresses[editingIdx].label;
    await updateAddressLabel(user.uid, oldLabel, editingLabel.trim());
    setEditingIdx(null);
    loadAddresses();
  };

  // Elimina una dirección guardada
  const handleDelete = (addr: UserAddress) => {
    Alert.alert("Eliminar dirección", `¿Eliminar "${addr.label}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          if (!user?.uid) return;
          await deleteAddress(user.uid, addr.label);
          if (selectedIdx !== null) setSelectedIdx(null);
          loadAddresses();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <View className="bg-primary pt-8 pb-6 px-6">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={onBack} className="mr-3">
            <Text className="text-text-inverse text-body-bold">←</Text>
          </TouchableOpacity>
          <Text className="text-h2 text-text-inverse">Tu dirección</Text>
        </View>
        <Text className="text-body text-text-inverse opacity-80">
          Completa los datos para el delivery
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-4"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
      >
        {savedAddresses.length > 0 && (
          <View>
            <Text className="text-label text-text-primary mb-2">
              Tu dirección guardada
            </Text>
            {savedAddresses.map((addr, i) => {
              const isSelected = selectedIdx === i;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => selectSaved(addr, i)}
                  onLongPress={() => handleDelete(addr)}
                  delayLongPress={2000}
                  className="rounded-2xl p-4 mb-2 active:opacity-80"
                  style={{
                    backgroundColor: isSelected ? "#f0fdf4" : "#fafafa",
                    borderWidth: 2,
                    borderColor: isSelected ? "#22c55e" : "#e5e7eb",
                  }}
                >
                  <View className="flex-row items-start">
                    <View className="w-12 h-12 bg-success-light rounded-xl justify-center items-center mr-3">
                      <Text className="text-xl">📍</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-body-bold text-text-primary">
                          {addr.label}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleRename(i)}
                          className="ml-2 p-1"
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text className="text-caption">✏️</Text>
                        </TouchableOpacity>
                      </View>
                      <Text
                        className="text-caption text-text-muted mt-1"
                        numberOfLines={1}
                      >
                        {addr.address}
                      </Text>
                      <Text className="text-caption text-text-muted mt-0.5">
                        📞 {addr.phone}
                      </Text>
                      {addr.notes ? (
                        <Text
                          className="text-caption text-text-muted mt-0.5"
                          numberOfLines={1}
                        >
                          📝 {addr.notes}
                        </Text>
                      ) : null}
                    </View>
                    {isSelected && (
                      <View className="w-6 h-6 bg-success rounded-full justify-center items-center">
                        <Text className="text-white text-caption font-bold">
                          ✓
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View>
          <Text className="text-label text-text-primary mb-2">
            Buscar en el mapa
          </Text>
        </View>

        <MapWebView
          initialLat={lat}
          initialLng={lng}
          onLocationSelect={(data) => {
            setAddress(data.address);
            setLat(data.lat);
            setLng(data.lng);
          }}
        />

        <View>
          <Text className="text-label text-text-primary mb-2">
            Dirección completa
          </Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Escribe tu dirección..."
            className="bg-surface-hover rounded-xl px-4 py-3 text-body border border-border"
            multiline
            numberOfLines={2}
          />
        </View>

        <View>
          <Text className="text-label text-text-primary mb-2">
            Teléfono de contacto
          </Text>
          <TextInput
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 9))}
            placeholder="999888777"
            keyboardType="phone-pad"
            maxLength={9}
            className="bg-surface-hover rounded-xl px-4 py-3 text-body border border-border"
          />
        </View>

        <View>
          <Text className="text-label text-text-primary mb-2">
            Notas adicionales (opcional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Ej: timbre azul, piso 2, etc."
            className="bg-surface-hover rounded-xl px-4 py-3 text-body border border-border"
            multiline
            numberOfLines={2}
          />
        </View>
      </ScrollView>

      <View
        className="px-6 py-4 border-t border-border"
        style={{ paddingBottom: Platform.OS === "android" ? 15 : 15 }}
      >
        <TouchableOpacity
          onPress={() =>
            canConfirm && onConfirm({ address, lat, lng, phone, notes })
          }
          disabled={!canConfirm}
          className="bg-primary py-4 rounded-xl items-center active:opacity-70"
          style={{ opacity: canConfirm ? 1 : 0.4 }}
        >
          <Text className="text-text-inverse text-body-bold">
            Confirmar dirección
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={editingIdx !== null} transparent animationType="fade">
        <View
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View className="bg-white rounded-2xl p-6 w-11/12 max-w-sm">
            <Text className="text-subtitle text-text-primary mb-4">
              Editar nombre
            </Text>
            <TextInput
              value={editingLabel}
              onChangeText={setEditingLabel}
              placeholder="Nombre de la dirección"
              className="bg-surface-hover rounded-xl px-4 py-3 text-body border border-border mb-4"
              autoFocus
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setEditingIdx(null)}
                className="flex-1 py-3 rounded-xl items-center border border-border"
              >
                <Text className="text-body text-text-secondary">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveRename}
                className="flex-1 py-3 rounded-xl items-center bg-primary"
              >
                <Text className="text-body-bold text-text-inverse">
                  Guardar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
