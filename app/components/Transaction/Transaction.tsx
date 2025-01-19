import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Transaction = () => {
  return (
    <div className=" mx-auto py-8 px-4">
      <Card className="w-full max-w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-8">
            {/* Payment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="Enter number without spaces"
                  className="w-full"
                />
                <span className="text-sm text-gray-500">
                  (enter number without spaces)
                </span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="mm/yy"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV Code</Label>
                <Input
                  id="cvv"
                  placeholder="3 or 4 digit code"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  className="w-full"
                />
              </div>
            </div>

            {/* Order Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Order Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Customer Billing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Billing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="billingFirstName">First Name</Label>
                  <Input
                    id="billingFirstName"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingLastName">Last Name</Label>
                  <Input
                    id="billingLastName"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingCompany">Company</Label>
                  <Input
                    id="billingCompany"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Address</Label>
                  <Input
                    id="billingAddress"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingCity">City</Label>
                  <Input
                    id="billingCity"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingState">State</Label>
                  <Input
                    id="billingState"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingZip">Zip</Label>
                  <Input
                    id="billingZip"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingCountry">Country</Label>
                  <Input
                    id="billingCountry"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingPhone">Phone</Label>
                  <Input
                    id="billingPhone"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingEmail">Email</Label>
                  <Input
                    id="billingEmail"
                    type="email"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="studentFirstName">First Name</Label>
                  <Input
                    id="studentFirstName"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentLastName">Last Name</Label>
                  <Input
                    id="studentLastName"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentAddress">Address</Label>
                  <Input
                    id="studentAddress"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentCity">City</Label>
                  <Input
                    id="studentCity"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentState">State</Label>
                  <Input
                    id="studentState"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentZip">Zip</Label>
                  <Input
                    id="studentZip"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentCountry">Country</Label>
                  <Input
                    id="studentCountry"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentPhone">Phone</Label>
                  <Input
                    id="studentPhone"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentEmail">Email</Label>
                  <Input
                    id="studentEmail"
                    type="email"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full md:w-auto bg-zinc-700 hover:bg-zinc-800">
              SUBMIT
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transaction;