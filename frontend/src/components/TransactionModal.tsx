import React, { useState } from "react";
import { X, ArrowRightLeft, PlusCircle, MinusCircle, SlidersHorizontal } from "lucide-react";
import { InventoryItem, LocationItem } from "../types";
import { postInventoryTransaction, TransactionPayload } from "../api";

interface TransactionModalProps {
  item: InventoryItem | null;
  locations: LocationItem[];
  defaultType?: "receipt" | "issue" | "adjustment" | "transfer";
  onClose: () => void;
  onSuccess: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  item,
  locations,
  defaultType = "receipt",
  onClose,
  onSuccess,
}) => {
  if (!item) return null;

  const [txType, setTxType] = useState<"receipt" | "issue" | "adjustment" | "transfer">(defaultType);
  const [quantity, setQuantity] = useState<string>("");
  const [toLocation, setToLocation] = useState<string>(
    locations.find((l) => l.code !== item.location_id && l.id !== item.location_id)?.code || ""
  );
  const [reason, setReason] = useState<string>("");
  const [referenceNo, setReferenceNo] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError("Please specify a valid positive quantity.");
      return;
    }

    if (txType === "adjustment" && !reason.trim()) {
      setError("A documented reason is mandatory for inventory audit adjustments.");
      return;
    }

    if (txType === "transfer") {
      if (!toLocation) {
        setError("Please choose a destination location for the transfer.");
        return;
      }
      if (toLocation === item.location_id || toLocation === item.location_uuid) {
        setError("Destination location must be different from source location.");
        return;
      }
      if (parsedQty > item.stock) {
        setError(`Insufficient stock for transfer. Available: ${item.stock} ${item.unit}.`);
        return;
      }
    }

    if (txType === "issue" && parsedQty > item.stock) {
      setError(`Cannot issue ${parsedQty} ${item.unit}. Available balance is ${item.stock} ${item.unit}.`);
      return;
    }

    setLoading(true);
    try {
      const payload: TransactionPayload = {
        item_id: item.sku || item.id,
        location_id: item.location_id,
        transaction_type: txType,
        quantity: parsedQty,
        to_location_id: txType === "transfer" ? toLocation : undefined,
        reason: reason.trim() || undefined,
        reference_no: referenceNo.trim() || undefined,
        actor_id: "demo-officer",
      };

      await postInventoryTransaction(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Transaction failed. Please review inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Inventory Action: {item.name}</h3>
            <div className="card-subtitle">
              Depot: <strong>{item.location_name}</strong> · Current Stock: <strong>{item.stock} {item.unit}</strong>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-alert" style={{ marginBottom: 16 }}>{error}</div>}

            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                <button
                  type="button"
                  className={`btn ${txType === "receipt" ? "btn-primary" : "btn-secondary"} btn-sm`}
                  onClick={() => setTxType("receipt")}
                >
                  <PlusCircle size={14} /> Receipt
                </button>
                <button
                  type="button"
                  className={`btn ${txType === "issue" ? "btn-primary" : "btn-secondary"} btn-sm`}
                  onClick={() => setTxType("issue")}
                >
                  <MinusCircle size={14} /> Issue
                </button>
                <button
                  type="button"
                  className={`btn ${txType === "adjustment" ? "btn-primary" : "btn-secondary"} btn-sm`}
                  onClick={() => setTxType("adjustment")}
                >
                  <SlidersHorizontal size={14} /> Adjust
                </button>
                <button
                  type="button"
                  className={`btn ${txType === "transfer" ? "btn-primary" : "btn-secondary"} btn-sm`}
                  onClick={() => setTxType("transfer")}
                >
                  <ArrowRightLeft size={14} /> Transfer
                </button>
              </div>
            </div>

            {txType === "transfer" && (
              <div className="form-group">
                <label className="form-label" htmlFor="destination-loc">
                  Destination Supply Depot
                </label>
                <select
                  id="destination-loc"
                  className="form-control"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  required
                >
                  <option value="">Select destination...</option>
                  {locations
                    .filter((l) => l.code !== item.location_id && l.id !== item.location_id)
                    .map((loc) => (
                      <option key={loc.id} value={loc.code || loc.id}>
                        {loc.name} ({loc.region || "Sector"})
                      </option>
                    ))}
                </select>
                <div className="form-hint">
                  Atomic transfer: source stock decreases and destination increases simultaneously.
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="tx-quantity">
                {txType === "adjustment" ? "Audited Physical Count Quantity" : "Quantity"} ({item.unit})
              </label>
              <input
                id="tx-quantity"
                type="number"
                min="0.01"
                step="any"
                className="form-control"
                placeholder={txType === "adjustment" ? `Current is ${item.stock}` : "e.g. 50"}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tx-reason">
                Documented Justification {txType === "adjustment" ? "(Required)" : "(Optional)"}
              </label>
              <input
                id="tx-reason"
                type="text"
                className="form-control"
                placeholder={
                  txType === "adjustment"
                    ? "Mandatory reason for reconciliation (e.g. Physical inventory count verified)"
                    : "e.g. Routine resupply convoy delivery"
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required={txType === "adjustment"}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tx-ref">
                Reference / PO / Voucher Number
              </label>
              <input
                id="tx-ref"
                type="text"
                className="form-control"
                placeholder="e.g. VOUCHER-2026-042"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Recording..." : `Confirm ${txType.toUpperCase()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
