using System;
using ReactiveUI;

namespace DairyFarm.Models
{
    public class Warehouse : ReactiveObject
    {
        private int _currentMilk;
        private readonly int _maxCapacity;

        public event Action? WarehouseFull;

        public int CurrentMilk
        {
            get => _currentMilk;
            private set
            {
                this.RaiseAndSetIfChanged(ref _currentMilk, value);
                if (_currentMilk >= MaxCapacity)
                {
                    WarehouseFull?.Invoke();
                }
            }
        }

        public int MaxCapacity => _maxCapacity;
        public int DisplayMaxCapacity => Math.Max(CurrentMilk, MaxCapacity);
        public int CappedMilk => Math.Min(CurrentMilk, MaxCapacity);



        public Warehouse(int maxCapacity)
        {
            _maxCapacity = maxCapacity;
        }

        public void AddMilk(int amount)
        {
            if (CurrentMilk >= MaxCapacity)
                return;

            CurrentMilk += amount;
        }


        public void ResetMilk()
        {
            CurrentMilk = 0;
        }
    }
}
