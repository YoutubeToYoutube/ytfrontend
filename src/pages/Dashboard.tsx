import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data for the dashboard
const mockRecentSales = [
  {
    id: "1",
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    amount: 125.99,
    avatar: "https://i.pravatar.cc/150?u=jean.dupont"
  },
  {
    id: "2",
    name: "Marie Martin",
    email: "marie.martin@example.com",
    amount: 89.50,
    avatar: "https://i.pravatar.cc/150?u=marie.martin"
  },
  {
    id: "3",
    name: "Pierre Bernard",
    email: "pierre.bernard@example.com",
    amount: 245.75,
    avatar: "https://i.pravatar.cc/150?u=pierre.bernard"
  },
  {
    id: "4",
    name: "Sophie Petit",
    email: "sophie.petit@example.com",
    amount: 199.99,
    avatar: "https://i.pravatar.cc/150?u=sophie.petit"
  },
  {
    id: "5",
    name: "Thomas Dubois",
    email: "thomas.dubois@example.com",
    amount: 149.50,
    avatar: "https://i.pravatar.cc/150?u=thomas.dubois"
  }
];

const mockTransactions = [
  {
    id: "1",
    status: "success",
    description: "Paiement abonnement premium",
    date: "2023-07-15",
    amount: 49.99
  },
  {
    id: "2",
    status: "pending",
    description: "Achat de crédits",
    date: "2023-07-14",
    amount: 25.00
  },
  {
    id: "3",
    status: "processing",
    description: "Abonnement mensuel",
    date: "2023-07-13",
    amount: 9.99
  },
  {
    id: "4",
    status: "success",
    description: "Achat de formation",
    date: "2023-07-10",
    amount: 199.99
  },
  {
    id: "5",
    status: "failed",
    description: "Renouvellement automatique",
    date: "2023-07-09",
    amount: 29.99
  }
];

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: "Total Revenus",
      value: "45,231.89 €",
      description: "+20.1% par rapport au mois dernier",
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Abonnements",
      value: "2,350",
      description: "+180.1% par rapport au mois dernier",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Ventes",
      value: "12,234",
      description: "+19% par rapport au mois dernier",
      icon: <CreditCard className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Utilisateurs Actifs",
      value: "573",
      description: "+201 depuis la dernière heure",
      icon: <Activity className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-4 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Tableau de bord - Bienvenue {user?.name}
            </h2>
            <div className="flex items-center space-x-2">
              <CalendarDateRangePicker />
              <Button>Télécharger</Button>
            </div>
          </div>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="analytics">Analytique</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      {stat.icon}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Vue d'ensemble</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
                      Graphique d'activité (à implémenter)
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Activités récentes</CardTitle>
                    <CardDescription>
                      Il y a eu {mockRecentSales.length} transactions ce mois-ci.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {mockRecentSales.map((sale) => (
                        <div key={sale.id} className="flex items-center">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={sale.avatar} alt="Avatar" />
                            <AvatarFallback>{sale.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{sale.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {sale.email}
                            </p>
                          </div>
                          <div className="ml-auto font-medium">
                            +{sale.amount.toFixed(2)} €
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Transactions</CardTitle>
                    <CardDescription>
                      Transactions récentes de votre compte.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Montant</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <Badge
                                variant={transaction.status === "pending" ? "outline" : "default"}
                                className={
                                  transaction.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : transaction.status === "processing"
                                    ? "bg-blue-100 text-blue-800"
                                    : transaction.status === "success"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }
                              >
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell className="text-right">
                              {transaction.amount.toFixed(2)} €
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Statistiques d'utilisation</CardTitle>
                    <CardDescription>
                      Utilisation de votre plateforme au cours des 30 derniers jours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <div className="font-medium">Utilisateurs actifs</div>
                          </div>
                          <div>2,350</div>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div className="h-full w-4/5 bg-primary" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <div className="font-medium">Sessions</div>
                          </div>
                          <div>12,234</div>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div className="h-full w-2/3 bg-primary" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <div className="font-medium">Taux de conversion</div>
                          </div>
                          <div>3.2%</div>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div className="h-full w-1/4 bg-primary" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <div className="font-medium">Temps moyen sur le site</div>
                          </div>
                          <div>3m 42s</div>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div className="h-full w-1/2 bg-primary" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
