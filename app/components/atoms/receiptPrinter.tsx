import React from "react";
import {
  Printer,
  Text,
  Br,
  Line,
  Row,
  Cut,
  render,
} from "react-thermal-printer";

export function ReceiptComponent() {
  const receipt = (
    <Printer type="epson">
      <Text bold={true}>Store Name</Text>
      <Br />
      <Line />
      <Text>Date: {new Date().toLocaleDateString()}</Text>
      <Text>Time: {new Date().toLocaleTimeString()}</Text>
      <Line />
      <Row left="Item 1" right="$10.00" />
      <Row left="Item 2" right="$5.00" />
      <Line />
      <Row left="Total" right="$15.00" />
      <Cut />
    </Printer>
  );

  const handlePrint = async () => {
    const commands = await render(receipt);
  };

  return (
    <div>
      <button onClick={handlePrint}>Print Receipt</button>
    </div>
  );
}
