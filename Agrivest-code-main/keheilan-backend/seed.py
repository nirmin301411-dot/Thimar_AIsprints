# =============================================================================
# seed.py
# Populates the Keheilan database with rich, presentation-ready data.
# Run with: python seed.py
# WARNING: Drops and recreates all data on each run.
# =============================================================================

from datetime import datetime, timedelta
from app import create_app
from app.config.database import db

app = create_app()


def seed():
    with app.app_context():
        from app.models.alert import Alert
        from app.models.transaction import Transaction
        from app.models.investment import Investment
        from app.models.milestone import Milestone
        from app.models.deal import Deal
        from app.models.farm import Farm
        from app.models.user import User

        print("Clearing existing data...")
        Alert.query.delete()
        Transaction.query.delete()
        Investment.query.delete()
        Milestone.query.delete()
        Deal.query.delete()
        Farm.query.delete()
        User.query.delete()
        db.session.commit()

        # ── Users ──────────────────────────────────────────────────────
        print("Seeding users...")

        admin = User(name="Keheilan Admin", phone="01000000000", national_id="29901010000001",
                     password="admin123", role="admin", governorate="Cairo")
        admin2 = User(name="Mariam Saleh", phone="01000000001", national_id="29901010000099",
                      password="admin123", role="admin", governorate="Giza")

        farmers = [
            User(name="James Mwangi", phone="01111111111", national_id="29901010000002",
                 password="farmer123", role="farmer", governorate="Murang'a"),
            User(name="Green Valley Co-op", phone="01111111112", national_id="29901010000003",
                 password="farmer123", role="farmer", governorate="Kericho"),
            User(name="Sun Ripe Ltd", phone="01111111113", national_id="29901010000004",
                 password="farmer123", role="farmer", governorate="Machakos"),
            User(name="Highland Coffee Co-op", phone="01111111114", national_id="29901010000005",
                 password="farmer123", role="farmer", governorate="Nyeri"),
            User(name="AquaGreens Ltd", phone="01111111115", national_id="29901010000006",
                 password="farmer123", role="farmer", governorate="Nairobi"),
            User(name="Nile Delta Organics", phone="01111111116", national_id="29901010000007",
                 password="farmer123", role="farmer", governorate="Beheira"),
            User(name="Sahara Dates Farm", phone="01111111117", national_id="29901010000008",
                 password="farmer123", role="farmer", governorate="Aswan"),
            User(name="Red Sea Herbs Co.", phone="01111111118", national_id="29901010000009",
                 password="farmer123", role="farmer", governorate="Hurghada"),
        ]

        investors = [
            User(name="Ahmed Hassan", phone="01222222221", national_id="29901010000010",
                 password="invest123", role="investor", governorate="Cairo", investor_profile="growth"),
            User(name="Sara Khalil", phone="01222222222", national_id="29901010000011",
                 password="invest123", role="investor", governorate="Alexandria", investor_profile="balanced"),
            User(name="Omar Farouk", phone="01222222223", national_id="29901010000012",
                 password="invest123", role="investor", governorate="Giza", investor_profile="conservative"),
            User(name="Layla Ibrahim", phone="01222222224", national_id="29901010000013",
                 password="invest123", role="investor", governorate="Mansoura", investor_profile="growth"),
            User(name="Youssef Nabil", phone="01222222225", national_id="29901010000014",
                 password="invest123", role="investor", governorate="Tanta", investor_profile="balanced"),
            User(name="Nour El-Din", phone="01222222226", national_id="29901010000015",
                 password="invest123", role="investor", governorate="Luxor", investor_profile="conservative"),
            User(name="Fatima Zaki", phone="01222222227", national_id="29901010000016",
                 password="invest123", role="investor", governorate="Assiut", investor_profile="growth"),
        ]

        db.session.add_all([admin, admin2] + farmers + investors)
        db.session.commit()

        # ── Farms ──────────────────────────────────────────────────────
        print("Seeding farms...")

        farm_data = [
            dict(op=farmers[0], name="Sunrise Organic Avocado Farm", gov="Murang'a", crop="avocado",
                 size=45.0, water="nile_canal", land="owned", status="active", score=92,
                 photo="https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80"),
            dict(op=farmers[1], name="Green Valley Tea Estate", gov="Kericho", crop="tea",
                 size=120.0, water="rain_fed", land="owned", status="active", score=88,
                 photo="https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&q=80"),
            dict(op=farmers[2], name="SunRipe Mango Orchards", gov="Machakos", crop="mango",
                 size=30.0, water="groundwater", land="leased", status="active", score=85,
                 photo="https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=80"),
            dict(op=farmers[3], name="Highland Coffee Cooperative", gov="Nyeri", crop="coffee",
                 size=85.0, water="rain_fed", land="owned", status="active", score=95,
                 photo="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80"),
            dict(op=farmers[4], name="AquaGreens Hydroponic Hub", gov="Nairobi", crop="vegetables",
                 size=2.0, water="mixed", land="leased", status="approved", score=90,
                 photo="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&q=80"),
            dict(op=farmers[5], name="Nile Delta Rice Fields", gov="Beheira", crop="rice",
                 size=200.0, water="nile_canal", land="owned", status="active", score=87,
                 photo="https://images.unsplash.com/photo-1536054337737-3e1a05f7e99d?w=600&q=80"),
            dict(op=farmers[6], name="Sahara Premium Dates", gov="Aswan", crop="dates",
                 size=60.0, water="groundwater", land="owned", status="active", score=91,
                 photo="https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600&q=80"),
            dict(op=farmers[7], name="Red Sea Herbal Gardens", gov="Hurghada", crop="herbs",
                 size=15.0, water="mixed", land="leased", status="pending", score=78,
                 photo="https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=600&q=80"),
        ]

        farm_objs = []
        for fd in farm_data:
            f = Farm(operator_id=fd["op"].id, name=fd["name"], governorate=fd["gov"],
                     crop_type=fd["crop"], land_size_feddans=fd["size"], water_source=fd["water"],
                     land_status=fd["land"], status=fd["status"], sustainability_score=fd["score"],
                     photo_urls=[fd["photo"]])
            farm_objs.append(f)
        db.session.add_all(farm_objs)
        db.session.commit()

        # ── Deals ──────────────────────────────────────────────────────
        print("Seeding deals...")

        deal_specs = [
            dict(farm=farm_objs[0], model="hybrid", goal=250000, funded=187500, ticket=50,
                 ret=18.5, dur=12, season="seifi", status="active", sent="bull", bid=45000,
                 flag="green", note="Strong EU export demand, excellent soil moisture, consistent rainfall."),
            dict(farm=farm_objs[1], model="operations", goal=500000, funded=425000, ticket=100,
                 ret=14.2, dur=18, season="shitawi", status="active", sent="bull", bid=90000,
                 flag="green", note="Established estate with Fair-Trade certification premium."),
            dict(farm=farm_objs[2], model="land", goal=180000, funded=108000, ticket=25,
                 ret=22.1, dur=9, season="seifi", status="fundraising", sent="neutral", bid=32000,
                 flag="yellow", note="High ROI but groundwater dependency creates moderate risk."),
            dict(farm=farm_objs[3], model="hybrid", goal=350000, funded=332500, ticket=75,
                 ret=16.8, dur=14, season="shitawi", status="active", sent="bull", bid=63000,
                 flag="green", note="Specialty coffee at 5-year high. Carbon-neutral certification."),
            dict(farm=farm_objs[4], model="operations", goal=120000, funded=48000, ticket=30,
                 ret=25.3, dur=6, season=None, status="fundraising", sent="bull", bid=20000,
                 flag="green", note="Urban farming demand growing 40% YoY. Tech eliminates weather risk."),
            dict(farm=farm_objs[5], model="operations", goal=600000, funded=540000, ticket=200,
                 ret=12.5, dur=10, season="seifi", status="active", sent="bull", bid=100000,
                 flag="green", note="Government-subsidized irrigation. Stable demand from domestic market."),
            dict(farm=farm_objs[6], model="hybrid", goal=400000, funded=280000, ticket=100,
                 ret=20.0, dur=15, season="shitawi", status="fundraising", sent="bull", bid=70000,
                 flag="green", note="Premium Medjool dates command top export prices. Low water needs."),
            dict(farm=farm_objs[7], model="land", goal=90000, funded=0, ticket=20,
                 ret=28.0, dur=8, season=None, status="fundraising", sent="neutral", bid=15000,
                 flag="yellow", note="New farm — pending approval. High return potential but unproven."),
        ]

        deal_objs = []
        for ds in deal_specs:
            d = Deal(farm_id=ds["farm"].id, model_type=ds["model"], goal_egp=ds["goal"],
                     funded_egp=ds["funded"], min_ticket_egp=ds["ticket"],
                     expected_return_pct=ds["ret"], duration_months=ds["dur"],
                     season=ds["season"], status=ds["status"], sentiment=ds["sent"],
                     opening_bid_egp=ds["bid"], ai_viability_flag=ds["flag"],
                     ai_viability_note=ds["note"])
            deal_objs.append(d)
        db.session.add_all(deal_objs)
        db.session.commit()

        # ── Investments ────────────────────────────────────────────────
        print("Seeding investments...")

        now = datetime.utcnow()
        inv_specs = [
            # Ahmed (growth) — 4 investments
            (investors[0], deal_objs[0], 2500, 90, 275),
            (investors[0], deal_objs[1], 5000, 160, 380),
            (investors[0], deal_objs[3], 3000, 50, 370),
            (investors[0], deal_objs[6], 4000, 20, 430),
            # Sara (balanced) — 3 investments
            (investors[1], deal_objs[0], 1000, 30, 335),
            (investors[1], deal_objs[5], 6000, 100, 200),
            (investors[1], deal_objs[6], 2000, 15, 440),
            # Omar (conservative) — 2 investments
            (investors[2], deal_objs[1], 8000, 200, 340),
            (investors[2], deal_objs[5], 10000, 150, 160),
            # Layla (growth) — 3 investments
            (investors[3], deal_objs[2], 3000, 40, 230),
            (investors[3], deal_objs[3], 5000, 60, 360),
            (investors[3], deal_objs[4], 2000, 10, 170),
            # Youssef (balanced) — 2 investments
            (investors[4], deal_objs[0], 1500, 70, 295),
            (investors[4], deal_objs[5], 4000, 90, 210),
            # Nour (conservative) — 1 investment
            (investors[5], deal_objs[1], 3000, 120, 420),
            # Fatima (growth) — 2 investments
            (investors[6], deal_objs[3], 2500, 35, 385),
            (investors[6], deal_objs[6], 3500, 10, 450),
        ]

        inv_objs = []
        for inv, deal, amt, days_ago, days_fwd in inv_specs:
            inv_objs.append(Investment(
                investor_id=inv.id, deal_id=deal.id, amount_egp=amt, status="active",
                invested_at=now - timedelta(days=days_ago),
                expected_return_date=now + timedelta(days=days_fwd),
            ))
        db.session.add_all(inv_objs)
        db.session.commit()

        # ── Milestones ─────────────────────────────────────────────────
        print("Seeding milestones...")

        ms_specs = [
            (farm_objs[0], deal_objs[0], "land_prepared", "completed", 80,
             "الأرض اتجهزت وتم تسوية التربة",
             "Land preparation complete. Soil leveling and irrigation channels finalized."),
            (farm_objs[0], deal_objs[0], "seeds_planted", "completed", 60,
             "زرعنا الأفوكادو النهارده",
             "Planting complete. 2,400 Hass avocado seedlings transplanted across 45 feddans."),
            (farm_objs[0], deal_objs[0], "mid_season", "in_progress", 10,
             "النباتات بتكبر كويس والمياه منتظمة",
             "Mid-season: crop development on track. Drip irrigation efficient, soil moisture optimal."),
            (farm_objs[1], deal_objs[1], "land_prepared", "completed", 150,
             "جهزنا الأرض للشاي",
             "Highland tea beds prepared. Soil pH adjusted to optimal 4.5-5.5 range."),
            (farm_objs[1], deal_objs[1], "seeds_planted", "completed", 120,
             "زراعة الشاي خلصت",
             "Tea bushes transplanted. 15,000 clone seedlings across 120 feddans."),
            (farm_objs[1], deal_objs[1], "mid_season", "completed", 35,
             "الشاي بينمو تمام والجو ساعد",
             "Mid-season: tea bushes thriving with favorable rainfall. Above-average leaf grade."),
            (farm_objs[3], deal_objs[3], "land_prepared", "completed", 100,
             "تجهيز أرض القهوة",
             "Coffee nursery beds prepared at 1,800m altitude. Shade trees planted."),
            (farm_objs[3], deal_objs[3], "seeds_planted", "completed", 80,
             "زرعنا شتلات القهوة",
             "12,000 Arabica SL28 seedlings planted with shade canopy established."),
            (farm_objs[3], deal_objs[3], "harvest_complete", "completed", 20,
             "حصاد القهوة خلص وكانت كمية كبيرة",
             "Harvest complete. 18.4 tonnes AA-grade coffee cherries, exceeding projection by 7%."),
            (farm_objs[5], deal_objs[5], "land_prepared", "completed", 130,
             "تسوية الأرض للأرز",
             "200 feddans leveled with laser precision. Irrigation canals connected to Nile branch."),
            (farm_objs[5], deal_objs[5], "seeds_planted", "completed", 100,
             "زراعة الأرز خلصت",
             "Rice paddy flooded and Sakha-106 variety planted. Excellent germination rate at 94%."),
            (farm_objs[5], deal_objs[5], "mid_season", "in_progress", 5,
             "الأرز بينمو كويس",
             "Mid-season: rice at tillering stage. Water levels maintained at 5cm. No pest issues."),
            (farm_objs[6], deal_objs[6], "land_prepared", "completed", 45,
             "تجهيز مزرعة البلح",
             "Date palm rows established with 8m spacing. Drip lines installed."),
            (farm_objs[6], deal_objs[6], "seeds_planted", "completed", 30,
             "غرس فسائل النخيل",
             "450 Medjool tissue-culture offshoots planted. Survival rate 98%."),
        ]

        ms_objs = []
        for farm, deal, mtype, mstatus, days_ago, raw, converted in ms_specs:
            m = Milestone(farm_id=farm.id, deal_id=deal.id, type=mtype, status=mstatus,
                          raw_input=raw, ai_converted_text=converted,
                          submitted_at=now - timedelta(days=days_ago))
            if mstatus == "completed":
                m.verified_at = now - timedelta(days=days_ago - 2)
            ms_objs.append(m)
        db.session.add_all(ms_objs)
        db.session.commit()

        # ── Transactions ───────────────────────────────────────────────
        print("Seeding transactions...")

        tx_specs = [
            # Ahmed
            (investors[0], "deposit", 20000, None, "Initial wallet top-up"),
            (investors[0], "allocation", 2500, deal_objs[0], "Investment in Sunrise Avocado"),
            (investors[0], "allocation", 5000, deal_objs[1], "Investment in Green Valley Tea"),
            (investors[0], "allocation", 3000, deal_objs[3], "Investment in Highland Coffee"),
            (investors[0], "allocation", 4000, deal_objs[6], "Investment in Sahara Dates"),
            (investors[0], "return", 385, deal_objs[3], "Q1 return — Highland Coffee"),
            (investors[0], "return", 220, deal_objs[0], "Q1 return — Sunrise Avocado"),
            # Sara
            (investors[1], "deposit", 15000, None, "Initial deposit"),
            (investors[1], "allocation", 1000, deal_objs[0], "Investment in Sunrise Avocado"),
            (investors[1], "allocation", 6000, deal_objs[5], "Investment in Nile Delta Rice"),
            (investors[1], "allocation", 2000, deal_objs[6], "Investment in Sahara Dates"),
            (investors[1], "return", 450, deal_objs[5], "Q1 return — Nile Delta Rice"),
            # Omar
            (investors[2], "deposit", 25000, None, "Initial deposit"),
            (investors[2], "allocation", 8000, deal_objs[1], "Investment in Green Valley Tea"),
            (investors[2], "allocation", 10000, deal_objs[5], "Investment in Nile Delta Rice"),
            (investors[2], "return", 680, deal_objs[1], "Q1 return — Green Valley Tea"),
            (investors[2], "return", 750, deal_objs[5], "Q2 return — Nile Delta Rice"),
            # Layla
            (investors[3], "deposit", 12000, None, "Initial deposit"),
            (investors[3], "allocation", 3000, deal_objs[2], "Investment in SunRipe Mango"),
            (investors[3], "allocation", 5000, deal_objs[3], "Investment in Highland Coffee"),
            (investors[3], "allocation", 2000, deal_objs[4], "Investment in AquaGreens Hydro"),
            # Youssef
            (investors[4], "deposit", 10000, None, "Initial deposit"),
            (investors[4], "allocation", 1500, deal_objs[0], "Investment in Sunrise Avocado"),
            (investors[4], "allocation", 4000, deal_objs[5], "Investment in Nile Delta Rice"),
            (investors[4], "return", 300, deal_objs[5], "Q1 return — Nile Delta Rice"),
            # Nour
            (investors[5], "deposit", 8000, None, "Initial deposit"),
            (investors[5], "allocation", 3000, deal_objs[1], "Investment in Green Valley Tea"),
            # Fatima
            (investors[6], "deposit", 10000, None, "Initial deposit"),
            (investors[6], "allocation", 2500, deal_objs[3], "Investment in Highland Coffee"),
            (investors[6], "allocation", 3500, deal_objs[6], "Investment in Sahara Dates"),
            (investors[6], "return", 310, deal_objs[3], "Q1 return — Highland Coffee"),
        ]

        tx_objs = []
        for user, ttype, amt, deal, note in tx_specs:
            tx_objs.append(Transaction(
                user_id=user.id, type=ttype, amount_egp=amt, status="completed",
                deal_id=deal.id if deal else None, note=note,
            ))
        db.session.add_all(tx_objs)
        db.session.commit()

        # ── Alerts ─────────────────────────────────────────────────────
        print("Seeding alerts...")

        alerts = [
            Alert(deal_id=deal_objs[2].id, severity="medium", status="open",
                  flag_reason="Groundwater level in Machakos dropped 15% below seasonal average.",
                  ai_reasoning="Farms relying on groundwater showed 12% yield reduction in similar 2022 conditions."),
            Alert(deal_id=deal_objs[4].id, severity="low", status="open",
                  flag_reason="Fundraising pace 18% below weekly target. Goal may not be reached before season.",
                  ai_reasoning="14-day trajectory: 60-day runway to goal, but season needs capital in 45 days."),
            Alert(deal_id=deal_objs[7].id, severity="high", status="open",
                  flag_reason="Farm pending approval for 30+ days. No KYC verification on operator.",
                  ai_reasoning="Operator Red Sea Herbs Co. has no verified national ID on file. Block until resolved."),
            Alert(deal_id=deal_objs[5].id, severity="low", status="resolved",
                  flag_reason="Minor irrigation pump failure reported on sector 3.",
                  ai_reasoning="Backup pump activated. No yield impact. Maintenance scheduled."),
            Alert(deal_id=deal_objs[3].id, severity="medium", status="resolved",
                  flag_reason="Coffee cherry prices dropped 8% week-over-week on international markets.",
                  ai_reasoning="Seasonal correction — historical data shows recovery within 2-3 weeks."),
        ]
        db.session.add_all(alerts)
        db.session.commit()

        # ── Summary ────────────────────────────────────────────────────
        print("\n[OK] Seed complete:")
        print(f"   Users:        {User.query.count()}")
        print(f"   Farms:        {Farm.query.count()}")
        print(f"   Deals:        {Deal.query.count()}")
        print(f"   Investments:  {Investment.query.count()}")
        print(f"   Milestones:   {Milestone.query.count()}")
        print(f"   Transactions: {Transaction.query.count()}")
        print(f"   Alerts:       {Alert.query.count()}")
        print("\nTest accounts:")
        print("   Admin    -> phone: 01000000000  password: admin123")
        print("   Farmer   -> phone: 01111111111  password: farmer123")
        print("   Investor -> phone: 01222222221  password: invest123")


if __name__ == "__main__":
    seed()
