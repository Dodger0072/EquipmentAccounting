using System;


// DairyFarmViewModel.cs
using System.Threading;
using System.Reactive.Linq;
using DairyFarm.Models;
using ReactiveUI;


namespace DairyFarm.ViewModels
{
    public class DairyFarmViewModel : ReactiveObject, IDisposable
    {
        private readonly Random _random = new();
        private readonly IDisposable _milkProduction;
        private readonly IDisposable _breakdowns;
        private readonly CancellationTokenSource _cts = new();

        public Warehouse Warehouse { get; }
        public Mechanic Mechanic { get; }
        public Loader Loader { get; }

        public DairyFarmViewModel(int warehouseCapacity = 100)
        {
            Warehouse = new Warehouse(warehouseCapacity);
            Mechanic = new Mechanic();
            Loader = new Loader();

            Warehouse.WarehouseFull += async () =>
            {
                if (!Loader.IsBusy)
                    await Loader.UnloadAsync(Warehouse);
            };

            _milkProduction = Observable.Interval(TimeSpan.FromSeconds(1))
                .Subscribe(_ => Warehouse.AddMilk(10));

            _breakdowns = Observable.Interval(TimeSpan.FromSeconds(5))
                .Subscribe(async _ =>
                {
                    if (_random.NextDouble() < 0.3 && !Mechanic.IsBusy)
                        await Mechanic.RepairAsync();
                });
        }

        public void Dispose()
        {
            _cts.Cancel();
            _milkProduction?.Dispose();
            _breakdowns?.Dispose();
        }
    }
}
